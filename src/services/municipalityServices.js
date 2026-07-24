// Import the Municipality data model
import { Municipality } from '../db/models/municipality.js';
// Import the Department data model to validate the parent foreign key
import { Department } from '../db/models/department.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Municipality entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean.
 */
export class MunicipalityServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new municipality record in the database.
   *
   * @param {Object} newMunicipality - The municipality data to be created.
   * @param {number} newMunicipality.id - The municipality primary key (no autoIncrement, assigned manually via DANE codes, matching the migration).
   * @param {string} newMunicipality.name - The municipality name.
   * @param {number} newMunicipality.departmentId - The id of the department this municipality belongs to.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newMunicipality) {

    try {
      // Verify a municipality with the same id does not already exist
      const existingMunicipalityById = await this._findById(newMunicipality.id);

      if (existingMunicipalityById) {
        throw Boom.conflict('El municipio ya existe con el identificador proporcionado');
      }

      // Verify the referenced department exists before inserting the foreign key
      await this._assertDepartmentExists(newMunicipality.departmentId);

      // Verify a municipality with the same name does not already exist within the same department
      const existingMunicipalityByName = await this._findByNameAndDepartment(
        newMunicipality.name,
        newMunicipality.departmentId
      );

      if (existingMunicipalityByName) {
        throw Boom.conflict('El municipio ya existe con ese nombre en el departamento seleccionado');
      }

      // Create the new record in the database
      await Municipality.create({
        id: newMunicipality.id,
        name: MunicipalityServices.normalizeName(newMunicipality.name),
        departmentId: newMunicipality.departmentId,
      });

      // Return a success response
      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el municipio en la base de datos' });
    }
  }

  /**
   * Updates an existing municipality record.
   *
   * @param {number} municipalityId - The id of the municipality to update.
   * @param {Object} newMunicipalityData - The new data to persist.
   * @param {string} [newMunicipalityData.name] - The new municipality name.
   * @param {number} [newMunicipalityData.departmentId] - The new department id, if the municipality is being reassigned.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(municipalityId, newMunicipalityData) {

    if (!newMunicipalityData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingMunicipality = await this._findById(municipalityId);

      if (!existingMunicipality) {
        throw Boom.notFound('Municipio no encontrado');
      }

      // If a new department is provided, verify it exists
      if (newMunicipalityData.departmentId) {
        await this._assertDepartmentExists(newMunicipalityData.departmentId);
      }

      // Resolve the department scope used to check for duplicate names
      const targetDepartmentId = newMunicipalityData.departmentId || existingMunicipality.departmentId;

      // If a new name is provided, verify it is not already used within the same department
      if (newMunicipalityData.name) {
        const municipalityWithSameName = await this._findByNameAndDepartment(
          newMunicipalityData.name,
          targetDepartmentId
        );

        if (municipalityWithSameName && municipalityWithSameName.id !== municipalityId) {
          throw Boom.conflict('Ya existe otro municipio con ese nombre en el departamento seleccionado');
        }
      }

      const [updatedRows] = await Municipality.update(
        {
          name: newMunicipalityData.name
            ? MunicipalityServices.normalizeName(newMunicipalityData.name)
            : newMunicipalityData.name,
          departmentId: newMunicipalityData.departmentId,
        },
        {
          where: { id: municipalityId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Municipio no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el municipio en la base de datos' });
    }
  }

  /**
   * Deletes a municipality record, provided it has no dependent users,
   * students or certificate signatures (the institution relationship
   * uses SET NULL and therefore never blocks the deletion).
   *
   * @param {number} municipalityId - The id of the municipality to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(municipalityId) {

    if (!municipalityId) {
      throw Boom.badRequest('No se proporcionó el identificador del municipio');
    }

    try {
      const existingMunicipality = await this._findById(municipalityId);

      if (!existingMunicipality) {
        throw Boom.notFound('Municipio no encontrado');
      }

      // Prevent deletion if the municipality still has associated records
      // that reference it with a RESTRICT constraint, giving a clearer
      // error than the raw constraint error from MySQL
      await this._assertNoRestrictingDependents(municipalityId);

      const deletedRows = await Municipality.destroy({
        where: { id: municipalityId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Municipio no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el municipio de la base de datos' });
    }
  }

  /**
   * Retrieves a single municipality by its id.
   *
   * @param {number} municipalityId - The id of the municipality to retrieve.
   * @returns {Promise<Municipality>} - The municipality record.
   */
  async listOne(municipalityId) {

    if (!municipalityId) {
      throw Boom.badRequest('No se proporcionó el identificador del municipio');
    }

    try {
      const theMunicipality = await this._findById(municipalityId);

      if (!theMunicipality) {
        throw Boom.notFound('Municipio no encontrado');
      }

      return theMunicipality;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el municipio' });
    }
  }

  /**
   * Retrieves all municipality records, ordered alphabetically by name.
   *
   * @returns {Promise<Municipality[]>} - The list of municipality records.
   */
  async listAll() {

    try {
      return await Municipality.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los municipios' });
    }
  }

  /**
   * Searches municipalities whose name partially matches the given text.
   * Supports the multi-criteria search requirement described in context.md.
   *
   * @param {string} partialName - The partial name to search for.
   * @returns {Promise<Municipality[]>} - The matching municipality records.
   */
  async listByPartialName(partialName) {

    if (!partialName) {
      throw Boom.badRequest('No se proporcionó un texto de búsqueda');
    }

    try {
      return await Municipality.findAll({
        where: { name: { [Op.like]: `%${partialName}%` } },
        order: [['name', 'ASC']]
      });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible buscar los municipios' });
    }
  }

  /**
   * Retrieves all municipalities that belong to a given department.
   * Useful for cascading selects (departamento -> municipio) in the UI.
   *
   * @param {number} departmentId - The id of the department to filter by.
   * @returns {Promise<Municipality[]>} - The municipalities that belong to the department.
   */
  async listByDepartment(departmentId) {

    if (!departmentId) {
      throw Boom.badRequest('No se proporcionó el identificador del departamento');
    }

    try {
      return await Municipality.findAll({
        where: { departmentId },
        order: [['name', 'ASC']]
      });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los municipios del departamento' });
    }
  }

  // ==========================================================
  // PRIVATE HELPERS (instance)
  // Naming convention: a leading underscore marks a method as
  // internal to this class. True '#private' class fields are
  // avoided to stay compatible with the ecmaVersion 12 (ES2021)
  // parser target declared in .eslintrc.json.
  // ==========================================================

  /**
   * Finds a municipality by its primary key.
   *
   * @private
   * @param {number} municipalityId - The id of the municipality to find.
   * @returns {Promise<Municipality|null>} - The municipality record, or null if not found.
   */
  async _findById(municipalityId) {
    return Municipality.findOne({ where: { id: municipalityId } });
  }

  /**
   * Finds a municipality by its exact name within a given department.
   *
   * @private
   * @param {string} name - The municipality name to find.
   * @param {number} departmentId - The department id to scope the search.
   * @returns {Promise<Municipality|null>} - The municipality record, or null if not found.
   */
  async _findByNameAndDepartment(name, departmentId) {
    return Municipality.findOne({ where: { name, departmentId } });
  }

  /**
   * Ensures the referenced department exists before it is used as a
   * foreign key, since 'municipio' references 'departamento' with
   * onDelete: 'RESTRICT' and allowNull: false at the database level.
   *
   * @private
   * @param {number} departmentId - The id of the department to verify.
   * @throws {Boom} - A bad request error when the department does not exist.
   * @returns {Promise<void>}
   */
  async _assertDepartmentExists(departmentId) {
    const theDepartment = await Department.findOne({ where: { id: departmentId } });

    if (!theDepartment) {
      throw Boom.badRequest('El departamento seleccionado no existe');
    }
  }

  /**
   * Ensures a municipality has no dependent records under a RESTRICT
   * constraint before allowing its deletion: 'usuario', 'estudiante' and
   * 'firma_certificado' all reference 'municipio' with onDelete:
   * 'RESTRICT'. The 'institucion' relationship is intentionally excluded
   * here since it uses onDelete: 'SET NULL' and therefore never blocks
   * the deletion at the database level.
   *
   * @private
   * @param {number} municipalityId - The id of the municipality to check.
   * @throws {Boom} - A conflict error when any restricting dependent exists.
   * @returns {Promise<void>}
   */
  async _assertNoRestrictingDependents(municipalityId) {
    const municipalityWithDependents = await Municipality.findOne({
      where: { id: municipalityId },
      include: [
        { association: 'users', required: false },
        { association: 'students', required: false },
        { association: 'certificateSignatures', required: false },
      ]
    });

    const hasRestrictingDependents = Boolean(
      municipalityWithDependents && (
        municipalityWithDependents.users?.length ||
        municipalityWithDependents.students?.length ||
        municipalityWithDependents.certificateSignatures?.length
      )
    );

    if (hasRestrictingDependents) {
      throw Boom.conflict(
        'No es posible eliminar el municipio porque tiene usuarios, estudiantes o firmas de certificado asociados'
      );
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes a municipality name by trimming surrounding whitespace,
   * without altering case or accents, to avoid duplicate rows that
   * differ only in blank spaces.
   *
   * @static
   * @param {string} name - The raw name to normalize.
   * @returns {string} - The normalized name.
   */
  static normalizeName(name) {
    return name.trim();
  }
}

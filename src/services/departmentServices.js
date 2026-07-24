// Import the Department data model
import { Department } from '../db/models/department.js';
// Import the Country data model to validate the parent foreign key
import { Country } from '../db/models/country.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Department entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean.
 */
export class DepartmentServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new department record in the database.
   *
   * @param {Object} newDepartment - The department data to be created.
   * @param {number} newDepartment.id - The department primary key (no autoIncrement, assigned manually via DANE codes, matching the migration).
   * @param {string} newDepartment.name - The department name.
   * @param {number} newDepartment.countryId - The id of the country this department belongs to.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newDepartment) {

    try {
      // Verify a department with the same id does not already exist
      const existingDepartmentById = await this._findById(newDepartment.id);

      if (existingDepartmentById) {
        throw Boom.conflict('El departamento ya existe con el identificador proporcionado');
      }

      // Verify the referenced country exists before inserting the foreign key
      await this._assertCountryExists(newDepartment.countryId);

      // Verify a department with the same name does not already exist within the same country
      const existingDepartmentByName = await this._findByNameAndCountry(
        newDepartment.name,
        newDepartment.countryId
      );

      if (existingDepartmentByName) {
        throw Boom.conflict('El departamento ya existe con ese nombre en el país seleccionado');
      }

      // Create the new record in the database
      await Department.create({
        id: newDepartment.id,
        name: DepartmentServices.normalizeName(newDepartment.name),
        countryId: newDepartment.countryId,
      });

      // Return a success response
      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el departamento en la base de datos' });
    }
  }

  /**
   * Updates an existing department record.
   *
   * @param {number} departmentId - The id of the department to update.
   * @param {Object} newDepartmentData - The new data to persist.
   * @param {string} [newDepartmentData.name] - The new department name.
   * @param {number} [newDepartmentData.countryId] - The new country id, if the department is being reassigned.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(departmentId, newDepartmentData) {

    if (!newDepartmentData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      // Verify the department exists before attempting the update
      const existingDepartment = await this._findById(departmentId);

      if (!existingDepartment) {
        throw Boom.notFound('Departamento no encontrado');
      }

      // If a new country is provided, verify it exists
      if (newDepartmentData.countryId) {
        await this._assertCountryExists(newDepartmentData.countryId);
      }

      // Resolve the country scope used to check for duplicate names
      const targetCountryId = newDepartmentData.countryId || existingDepartment.countryId;

      // If a new name is provided, verify it is not already used within the same country
      if (newDepartmentData.name) {
        const departmentWithSameName = await this._findByNameAndCountry(
          newDepartmentData.name,
          targetCountryId
        );

        if (departmentWithSameName && departmentWithSameName.id !== departmentId) {
          throw Boom.conflict('Ya existe otro departamento con ese nombre en el país seleccionado');
        }
      }

      // Update the record in the database
      const [updatedRows] = await Department.update(
        {
          name: newDepartmentData.name
            ? DepartmentServices.normalizeName(newDepartmentData.name)
            : newDepartmentData.name,
          countryId: newDepartmentData.countryId,
        },
        {
          where: { id: departmentId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Departamento no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el departamento en la base de datos' });
    }
  }

  /**
   * Deletes a department record, provided it has no dependent municipalities.
   *
   * @param {number} departmentId - The id of the department to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(departmentId) {

    if (!departmentId) {
      throw Boom.badRequest('No se proporcionó el identificador del departamento');
    }

    try {
      const existingDepartment = await this._findById(departmentId);

      if (!existingDepartment) {
        throw Boom.notFound('Departamento no encontrado');
      }

      // Prevent deletion if the department still has associated municipalities,
      // giving a clearer error than the raw RESTRICT constraint from MySQL
      await this._assertNoAssociatedMunicipalities(departmentId);

      const deletedRows = await Department.destroy({
        where: { id: departmentId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Departamento no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el departamento de la base de datos' });
    }
  }

  /**
   * Retrieves a single department by its id.
   *
   * @param {number} departmentId - The id of the department to retrieve.
   * @returns {Promise<Department>} - The department record.
   */
  async listOne(departmentId) {

    if (!departmentId) {
      throw Boom.badRequest('No se proporcionó el identificador del departamento');
    }

    try {
      const theDepartment = await this._findById(departmentId);

      if (!theDepartment) {
        throw Boom.notFound('Departamento no encontrado');
      }

      return theDepartment;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el departamento' });
    }
  }

  /**
   * Retrieves all department records, ordered alphabetically by name.
   *
   * @returns {Promise<Department[]>} - The list of department records.
   */
  async listAll() {

    try {
      return await Department.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los departamentos' });
    }
  }

  /**
   * Searches departments whose name partially matches the given text.
   * Supports the multi-criteria search requirement described in context.md.
   *
   * @param {string} partialName - The partial name to search for.
   * @returns {Promise<Department[]>} - The matching department records.
   */
  async listByPartialName(partialName) {

    if (!partialName) {
      throw Boom.badRequest('No se proporcionó un texto de búsqueda');
    }

    try {
      return await Department.findAll({
        where: { name: { [Op.like]: `%${partialName}%` } },
        order: [['name', 'ASC']]
      });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible buscar los departamentos' });
    }
  }

  /**
   * Retrieves all departments that belong to a given country. Useful for
   * cascading selects (país -> departamento -> municipio) in the UI.
   *
   * @param {number} countryId - The id of the country to filter by.
   * @returns {Promise<Department[]>} - The departments that belong to the country.
   */
  async listByCountry(countryId) {

    if (!countryId) {
      throw Boom.badRequest('No se proporcionó el identificador del país');
    }

    try {
      return await Department.findAll({
        where: { countryId },
        order: [['name', 'ASC']]
      });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los departamentos del país' });
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
   * Finds a department by its primary key.
   *
   * @private
   * @param {number} departmentId - The id of the department to find.
   * @returns {Promise<Department|null>} - The department record, or null if not found.
   */
  async _findById(departmentId) {
    return Department.findOne({ where: { id: departmentId } });
  }

  /**
   * Finds a department by its exact name within a given country.
   *
   * @private
   * @param {string} name - The department name to find.
   * @param {number} countryId - The country id to scope the search.
   * @returns {Promise<Department|null>} - The department record, or null if not found.
   */
  async _findByNameAndCountry(name, countryId) {
    return Department.findOne({ where: { name, countryId } });
  }

  /**
   * Ensures the referenced country exists before it is used as a
   * foreign key, since 'departamento' references 'pais' with
   * onDelete: 'RESTRICT' and allowNull: false at the database level.
   *
   * @private
   * @param {number} countryId - The id of the country to verify.
   * @throws {Boom} - A bad request error when the country does not exist.
   * @returns {Promise<void>}
   */
  async _assertCountryExists(countryId) {
    const theCountry = await Country.findOne({ where: { id: countryId } });

    if (!theCountry) {
      throw Boom.badRequest('El país seleccionado no existe');
    }
  }

  /**
   * Ensures a department has no associated municipalities before
   * allowing its deletion, since 'municipio' references 'departamento'
   * with onDelete: 'RESTRICT'.
   *
   * @private
   * @param {number} departmentId - The id of the department to check.
   * @throws {Boom} - A conflict error when dependent municipalities exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedMunicipalities(departmentId) {
    const departmentWithMunicipalities = await Department.findOne({
      where: { id: departmentId },
      include: [{ association: 'municipalities', required: true }]
    });

    if (departmentWithMunicipalities) {
      throw Boom.conflict('No es posible eliminar el departamento porque tiene municipios asociados');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes a department name by trimming surrounding whitespace,
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

// Import the Institution data model
import { Institution } from '../db/models/institution.js';
// Import the Municipality data model to validate the optional foreign key
import { Municipality } from '../db/models/municipality.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Institution entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. The primary key is AUTO_INCREMENT and fully managed by
 * MySQL/Sequelize, so it is never requested, validated, or passed into
 * Institution.create() — see the mandatory createOne rule for this
 * project.
 */
export class InstitutionServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new institution record in the database.
   *
   * @param {Object} newInstitution - The institution data to be created.
   * @param {string} newInstitution.name - The institution name.
   * @param {string} newInstitution.institutionalCode - The institutional (DANE) code assigned by the Ministry of Education.
   * @param {string} newInstitution.address - The institution address.
   * @param {number} [newInstitution.municipalityId] - The id of the municipality this institution belongs to (optional).
   * @param {string} newInstitution.email - The institution email.
   * @param {string} newInstitution.nitId - The institution tax identification number (NIT).
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newInstitution) {

    try {
      // If a municipality is provided, verify it exists before inserting the foreign key
      if (newInstitution.municipalityId) {
        await this._assertMunicipalityExists(newInstitution.municipalityId);
      }

      // Verify an institution with the same name does not already exist.
      // Duplicate checks are performed only over business attributes,
      // never over the auto-generated id.
      const existingInstitutionByName = await this._findByName(newInstitution.name);

      if (existingInstitutionByName) {
        throw Boom.conflict('La institución ya existe con el nombre proporcionado');
      }

      // Verify an institution with the same institutional code does not already exist
      const normalizedInstitutionalCode = InstitutionServices.formatInstitutionalCode(
        newInstitution.institutionalCode
      );
      const existingInstitutionByCode = await this._findByInstitutionalCode(normalizedInstitutionalCode);

      if (existingInstitutionByCode) {
        throw Boom.conflict('La institución ya existe con el código institucional proporcionado');
      }

      // Verify an institution with the same NIT does not already exist
      const existingInstitutionByNitId = await this._findByNitId(newInstitution.nitId);

      if (existingInstitutionByNitId) {
        throw Boom.conflict('La institución ya existe con el NIT proporcionado');
      }

      // Create the new record in the database. The id is AUTO_INCREMENT
      // at the database level, so it is never passed explicitly here.
      await Institution.create({
        name: InstitutionServices.normalizeName(newInstitution.name),
        institutionalCode: normalizedInstitutionalCode,
        address: newInstitution.address,
        municipalityId: newInstitution.municipalityId,
        email: InstitutionServices.normalizeEmail(newInstitution.email),
        nitId: InstitutionServices.normalizeNitId(newInstitution.nitId),
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear la institución en la base de datos' });
    }
  }

  /**
   * Updates an existing institution record.
   *
   * @param {number} institutionId - The id of the institution to update.
   * @param {Object} newInstitutionData - The new data to persist.
   * @param {string} [newInstitutionData.name] - The new institution name.
   * @param {string} [newInstitutionData.institutionalCode] - The new institutional code.
   * @param {string} [newInstitutionData.address] - The new institution address.
   * @param {number} [newInstitutionData.municipalityId] - The new municipality id, if the institution is being reassigned.
   * @param {string} [newInstitutionData.email] - The new institution email.
   * @param {string} [newInstitutionData.nitId] - The new institution NIT.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(institutionId, newInstitutionData) {

    if (!newInstitutionData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingInstitution = await this._findById(institutionId);

      if (!existingInstitution) {
        throw Boom.notFound('Institución no encontrada');
      }

      // If a new municipality is provided, verify it exists
      if (newInstitutionData.municipalityId) {
        await this._assertMunicipalityExists(newInstitutionData.municipalityId);
      }

      // If a new name is provided, verify it is not already used by another institution
      if (newInstitutionData.name) {
        const institutionWithSameName = await this._findByName(newInstitutionData.name);

        if (institutionWithSameName && institutionWithSameName.id !== institutionId) {
          throw Boom.conflict('Ya existe otra institución registrada con ese nombre');
        }
      }

      // If a new institutional code is provided, verify it is not already used
      let normalizedInstitutionalCode = newInstitutionData.institutionalCode;

      if (newInstitutionData.institutionalCode) {
        normalizedInstitutionalCode = InstitutionServices.formatInstitutionalCode(
          newInstitutionData.institutionalCode
        );
        const institutionWithSameCode = await this._findByInstitutionalCode(normalizedInstitutionalCode);

        if (institutionWithSameCode && institutionWithSameCode.id !== institutionId) {
          throw Boom.conflict('Ya existe otra institución registrada con ese código institucional');
        }
      }

      // If a new NIT is provided, verify it is not already used
      if (newInstitutionData.nitId) {
        const institutionWithSameNitId = await this._findByNitId(newInstitutionData.nitId);

        if (institutionWithSameNitId && institutionWithSameNitId.id !== institutionId) {
          throw Boom.conflict('Ya existe otra institución registrada con ese NIT');
        }
      }

      const [updatedRows] = await Institution.update(
        {
          name: newInstitutionData.name
            ? InstitutionServices.normalizeName(newInstitutionData.name)
            : newInstitutionData.name,
          institutionalCode: normalizedInstitutionalCode,
          address: newInstitutionData.address,
          municipalityId: newInstitutionData.municipalityId,
          email: newInstitutionData.email
            ? InstitutionServices.normalizeEmail(newInstitutionData.email)
            : newInstitutionData.email,
          nitId: newInstitutionData.nitId
            ? InstitutionServices.normalizeNitId(newInstitutionData.nitId)
            : newInstitutionData.nitId,
        },
        {
          where: { id: institutionId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Institución no encontrada');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar la institución en la base de datos' });
    }
  }

  /**
   * Deletes an institution record, provided it has no dependent
   * certificates. The relationship with Group uses SET NULL and
   * therefore never blocks the deletion.
   *
   * @param {number} institutionId - The id of the institution to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(institutionId) {

    if (!institutionId) {
      throw Boom.badRequest('No se proporcionó el identificador de la institución');
    }

    try {
      const existingInstitution = await this._findById(institutionId);

      if (!existingInstitution) {
        throw Boom.notFound('Institución no encontrada');
      }

      // Prevent deletion if the institution still has associated
      // certificates, giving a clearer error than the raw RESTRICT
      // constraint from MySQL
      await this._assertNoAssociatedCertificates(institutionId);

      const deletedRows = await Institution.destroy({
        where: { id: institutionId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Institución no encontrada');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar la institución de la base de datos' });
    }
  }

  /**
   * Retrieves a single institution by its id.
   *
   * @param {number} institutionId - The id of the institution to retrieve.
   * @returns {Promise<Institution>} - The institution record.
   */
  async listOne(institutionId) {

    if (!institutionId) {
      throw Boom.badRequest('No se proporcionó el identificador de la institución');
    }

    try {
      const theInstitution = await this._findById(institutionId);

      if (!theInstitution) {
        throw Boom.notFound('Institución no encontrada');
      }

      return theInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar la institución' });
    }
  }

  /**
   * Retrieves all institution records, ordered alphabetically by name.
   *
   * @returns {Promise<Institution[]>} - The list of institution records.
   */
  async listAll() {

    try {
      return await Institution.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar las instituciones' });
    }
  }

  /**
   * Searches institutions whose name partially matches the given text.
   * Supports the multi-criteria search requirement described in context.md.
   *
   * @param {string} partialName - The partial name to search for.
   * @returns {Promise<Institution[]>} - The matching institution records.
   */
  async listByPartialName(partialName) {

    if (!partialName) {
      throw Boom.badRequest('No se proporcionó un texto de búsqueda');
    }

    try {
      return await Institution.findAll({
        where: { name: { [Op.like]: `%${partialName}%` } },
        order: [['name', 'ASC']]
      });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible buscar las instituciones' });
    }
  }

  /**
   * Retrieves all institutions that belong to a given municipality.
   * Useful for cascading selects (municipio -> institución) in the UI.
   *
   * @param {number} municipalityId - The id of the municipality to filter by.
   * @returns {Promise<Institution[]>} - The institutions that belong to the municipality.
   */
  async listByMunicipality(municipalityId) {

    if (!municipalityId) {
      throw Boom.badRequest('No se proporcionó el identificador del municipio');
    }

    try {
      return await Institution.findAll({
        where: { municipalityId },
        order: [['name', 'ASC']]
      });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar las instituciones del municipio' });
    }
  }

  /**
   * Retrieves a single institution by its institutional (DANE) code.
   *
   * @param {string} institutionalCode - The institutional code to search for.
   * @returns {Promise<Institution>} - The matching institution record.
   */
  async listByInstitutionalCode(institutionalCode) {

    if (!institutionalCode) {
      throw Boom.badRequest('No se proporcionó el código institucional');
    }

    try {
      const theInstitution = await this._findByInstitutionalCode(
        InstitutionServices.formatInstitutionalCode(institutionalCode)
      );

      if (!theInstitution) {
        throw Boom.notFound('Institución no encontrada con el código institucional proporcionado');
      }

      return theInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar la institución por su código institucional' });
    }
  }

  /**
   * Retrieves a single institution by its tax identification number (NIT).
   *
   * @param {string} nitId - The NIT to search for.
   * @returns {Promise<Institution>} - The matching institution record.
   */
  async listByNitId(nitId) {

    if (!nitId) {
      throw Boom.badRequest('No se proporcionó el NIT de la institución');
    }

    try {
      const theInstitution = await this._findByNitId(nitId);

      if (!theInstitution) {
        throw Boom.notFound('Institución no encontrada con el NIT proporcionado');
      }

      return theInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar la institución por su NIT' });
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
   * Finds an institution by its primary key.
   *
   * @private
   * @param {number} institutionId - The id of the institution to find.
   * @returns {Promise<Institution|null>} - The institution record, or null if not found.
   */
  async _findById(institutionId) {
    return Institution.findOne({ where: { id: institutionId } });
  }

  /**
   * Finds an institution by its exact name.
   *
   * @private
   * @param {string} name - The institution name to find.
   * @returns {Promise<Institution|null>} - The institution record, or null if not found.
   */
  async _findByName(name) {
    return Institution.findOne({ where: { name } });
  }

  /**
   * Finds an institution by its exact institutional code.
   *
   * @private
   * @param {string} institutionalCode - The institutional code to find.
   * @returns {Promise<Institution|null>} - The institution record, or null if not found.
   */
  async _findByInstitutionalCode(institutionalCode) {
    return Institution.findOne({ where: { institutionalCode } });
  }

  /**
   * Finds an institution by its exact tax identification number (NIT).
   *
   * @private
   * @param {string} nitId - The NIT to find.
   * @returns {Promise<Institution|null>} - The institution record, or null if not found.
   */
  async _findByNitId(nitId) {
    return Institution.findOne({ where: { nitId } });
  }

  /**
   * Ensures the referenced municipality exists before it is used as a
   * foreign key. 'institucion' references 'municipio' with onDelete:
   * 'SET NULL' and allowNull: true, so this check only runs when a
   * municipality id is actually provided.
   *
   * @private
   * @param {number} municipalityId - The id of the municipality to verify.
   * @throws {Boom} - A bad request error when the municipality does not exist.
   * @returns {Promise<void>}
   */
  async _assertMunicipalityExists(municipalityId) {
    const theMunicipality = await Municipality.findOne({ where: { id: municipalityId } });

    if (!theMunicipality) {
      throw Boom.badRequest('El municipio seleccionado no existe');
    }
  }

  /**
   * Ensures an institution has no associated certificates before
   * allowing its deletion, since 'certificado' references 'institucion'
   * with onDelete: 'RESTRICT' and allowNull: false.
   *
   * @private
   * @param {number} institutionId - The id of the institution to check.
   * @throws {Boom} - A conflict error when dependent certificates exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedCertificates(institutionId) {
    const institutionWithCertificates = await Institution.findOne({
      where: { id: institutionId },
      include: [{ association: 'certificates', required: true }]
    });

    if (institutionWithCertificates) {
      throw Boom.conflict('No es posible eliminar la institución porque tiene certificados asociados');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes an institution name by trimming surrounding whitespace.
   *
   * @static
   * @param {string} name - The raw name to normalize.
   * @returns {string} - The normalized name.
   */
  static normalizeName(name) {
    return name.trim();
  }

  /**
   * Normalizes an institutional (DANE) code to the format expected by
   * the institutionalCode RegEx and stored in the database
   * (trimmed, uppercase, e.g. 'ie123' -> 'IE123').
   *
   * @static
   * @param {string} institutionalCode - The raw institutional code to normalize.
   * @returns {string} - The normalized institutional code.
   */
  static formatInstitutionalCode(institutionalCode) {
    return institutionalCode.trim().toUpperCase();
  }

  /**
   * Normalizes an institution email by trimming surrounding whitespace
   * and lowercasing it, since email addresses are conventionally
   * case-insensitive.
   *
   * @static
   * @param {string} email - The raw email to normalize.
   * @returns {string} - The normalized email.
   */
  static normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  /**
   * Normalizes an institution NIT by trimming surrounding whitespace.
   *
   * @static
   * @param {string} nitId - The raw NIT to normalize.
   * @returns {string} - The normalized NIT.
   */
  static normalizeNitId(nitId) {
    return nitId.trim();
  }
}

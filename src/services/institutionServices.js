// Import the Institution data model
import { Institution } from '../db/models/institution.js';
// Import the models that reference Institution, needed to enforce the delete-guard business rules
import { Certificate } from '../db/models/certificate.js';
import { Group } from '../db/models/group.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Institution (institucion) entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * Institution carries three independently unique columns ('name',
 * 'institutionalCode', 'nitId'), so both createOne and updateOne check
 * each one individually rather than relying on a single composite key,
 * unlike Group or Department.
 *
 * 'certificado' points to this table with onDelete: 'RESTRICT' (hard
 * constraint, since an issued certificate must always be traceable to
 * its institution), while 'grupo' points to it with onDelete: 'SET
 * NULL' (soft). The deletion guard below checks both.
 */
export class InstitutionServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new institution record in the database.
   *
   * @param {Object} newInstitution
   * @param {string} newInstitution.name
   * @param {string} newInstitution.institutionalCode
   * @param {string} newInstitution.address
   * @param {number} [newInstitution.municipalityId]
   * @param {string} newInstitution.email
   * @param {string} newInstitution.nitId
   * @returns {Promise<{status: string}>}
   */
  async createOne(newInstitution) {

    try {

      // Normalize the unique text fields before persisting them
      const normalizedName = InstitutionServices.normalizeText(newInstitution.name);
      const normalizedCode = InstitutionServices.normalizeText(newInstitution.institutionalCode);
      const normalizedNit = InstitutionServices.normalizeText(newInstitution.nitId);

      // Verify none of the three independently unique fields collide
      // with an already existing institution
      await this._assertUniqueFields({
        name: normalizedName,
        institutionalCode: normalizedCode,
        nitId: normalizedNit,
      });

      // Create the record (id is generated automatically)
      await Institution.create({
        name: normalizedName,
        institutionalCode: normalizedCode,
        address: newInstitution.address,
        municipalityId: newInstitution.municipalityId,
        email: newInstitution.email,
        nitId: normalizedNit,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to create the institution in the database'
      });
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
   * @param {number} [newInstitutionData.municipalityId] - The new parent municipality id.
   * @param {string} [newInstitutionData.email] - The new institution email.
   * @param {string} [newInstitutionData.nitId] - The new tax identification number.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(institutionId, newInstitutionData) {

    if (!newInstitutionData) {
      throw Boom.badRequest('No data was provided to update');
    }

    try {
      // Verify the institution exists before attempting the update
      const existingInstitution = await this._findById(institutionId);

      if (!existingInstitution) {
        throw Boom.notFound('Institution not found');
      }

      // Normalize the unique text fields before persisting them, when provided
      const normalizedName = newInstitutionData.name
        ? InstitutionServices.normalizeText(newInstitutionData.name)
        : newInstitutionData.name;
      const normalizedCode = newInstitutionData.institutionalCode
        ? InstitutionServices.normalizeText(newInstitutionData.institutionalCode)
        : newInstitutionData.institutionalCode;
      const normalizedNit = newInstitutionData.nitId
        ? InstitutionServices.normalizeText(newInstitutionData.nitId)
        : newInstitutionData.nitId;

      // Verify none of the three independently unique fields collide
      // with another already existing institution
      await this._assertUniqueFields(
        { name: normalizedName, institutionalCode: normalizedCode, nitId: normalizedNit },
        institutionId
      );

      // Update the record in the database
      const [updatedRows] = await Institution.update(
        {
          name: normalizedName,
          institutionalCode: normalizedCode,
          address: newInstitutionData.address,
          municipalityId: newInstitutionData.municipalityId,
          email: newInstitutionData.email,
          nitId: normalizedNit,
        },
        {
          where: { id: institutionId }
        }
      );

      // If no rows were updated, return an error
      if (!updatedRows) {
        throw Boom.notFound('Institution not found');
      }

      // Return a success response
      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to update the institution in the database' });
    }
  }

  /**
   * Deletes an institution record, provided it has no associated
   * certificates or groups.
   *
   * @param {number} institutionId - The id of the institution to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(institutionId) {

    if (!institutionId) {
      throw Boom.badRequest('No institution identifier was provided');
    }

    try {
      // Verify the institution exists before attempting the deletion
      const existingInstitution = await this._findById(institutionId);

      if (!existingInstitution) {
        throw Boom.notFound('Institution not found');
      }

      // Prevent deletion if the institution still has associated
      // certificates, giving a clearer error than the raw RESTRICT
      // constraint from MySQL
      await this._assertNoAssociatedCertificates(institutionId);

      // Also prevent deletion if it still has associated groups. This
      // is a business-rule guard rather than a hard database constraint,
      // since 'grupo' references 'institucion' with SET NULL.
      await this._assertNoAssociatedGroups(institutionId);

      // Destroy the record in the database
      const deletedRows = await Institution.destroy({
        where: { id: institutionId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Institution not found');
      }

      // Return a success response
      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to delete the institution from the database' });
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
      throw Boom.badRequest('No institution identifier was provided');
    }

    try {
      const theInstitution = await this._findById(institutionId);

      if (!theInstitution) {
        throw Boom.notFound('Institution not found');
      }

      return theInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution' });
    }
  }

  /**
   * Retrieves all institution records, ordered alphabetically by name.
   *
   * @returns {Promise<Institution[]>} - The list of institution records.
   */
  async listAll() {

    try {
      const allInstitutions = await Institution.findAll({
        order: [['name', 'ASC']]
      });

      return allInstitutions;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institutions' });
    }
  }

  /**
   * Searches institutions whose name partially matches the given text.
   * Supports the multi-criteria search requirement described in
   * context.md (e.g. 'Nombre parcial').
   *
   * @param {string} partialName - The partial name to search for.
   * @returns {Promise<Institution[]>} - The matching institution records.
   */
  async listByPartialName(partialName) {

    if (!partialName) {
      throw Boom.badRequest('No search text was provided');
    }

    try {
      const matchingInstitutions = await Institution.findAll({
        where: {
          name: { [Op.like]: `%${partialName}%` }
        },
        order: [['name', 'ASC']]
      });

      return matchingInstitutions;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to search the institutions' });
    }
  }

  /**
   * Retrieves a single institution by its exact institutional code
   * (assigned by the Ministry of Education).
   *
   * @param {string} institutionalCode - The institutional code to search for.
   * @returns {Promise<Institution>} - The matching institution record.
   */
  async listByInstitutionalCode(institutionalCode) {

    if (!institutionalCode) {
      throw Boom.badRequest('No institutional code was provided');
    }

    try {
      const theInstitution = await this._findByInstitutionalCode(institutionalCode);

      if (!theInstitution) {
        throw Boom.notFound('Institution not found with the provided institutional code');
      }

      return theInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution by its institutional code' });
    }
  }

  /**
   * Retrieves a single institution by its exact tax identification
   * number (NIT).
   *
   * @param {string} nitId - The NIT to search for.
   * @returns {Promise<Institution>} - The matching institution record.
   */
  async listByNit(nitId) {

    if (!nitId) {
      throw Boom.badRequest('No NIT was provided');
    }

    try {
      const theInstitution = await this._findByNit(nitId);

      if (!theInstitution) {
        throw Boom.notFound('Institution not found with the provided NIT');
      }

      return theInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution by its NIT' });
    }
  }

  /**
   * Retrieves all institutions belonging to a given municipality. Useful
   * for cascading selects in the UI and for the 'Combinación de filtros'
   * search requirement described in context.md.
   *
   * @param {number} municipalityId - The id of the municipality.
   * @returns {Promise<Institution[]>} - The matching institution records.
   */
  async listByMunicipality(municipalityId) {

    if (!municipalityId) {
      throw Boom.badRequest('No municipality identifier was provided');
    }

    try {
      const institutionsByMunicipality = await Institution.findAll({
        where: { municipalityId },
        order: [['name', 'ASC']]
      });

      return institutionsByMunicipality;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institutions for the given municipality' });
    }
  }

  // ==========================================================
  // PRIVATE HELPERS (instance)
  // Naming convention: a leading underscore marks a method as
  // internal to this class and not meant to be called from
  // controllers. True '#private' class fields are intentionally
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
   * Finds an institution by its exact NIT.
   *
   * @private
   * @param {string} nitId - The NIT to find.
   * @returns {Promise<Institution|null>} - The institution record, or null if not found.
   */
  async _findByNit(nitId) {
    return Institution.findOne({ where: { nitId } });
  }

  /**
   * Verifies that 'name', 'institutionalCode' and 'nitId' do not
   * collide with another already existing institution. Each field is
   * checked independently since all three carry their own unique
   * constraint at the database level (see models/institution.js).
   *
   * @private
   * @param {Object} fields - The fields to check.
   * @param {string} [fields.name] - The name to verify.
   * @param {string} [fields.institutionalCode] - The institutional code to verify.
   * @param {string} [fields.nitId] - The NIT to verify.
   * @param {number} [excludedInstitutionId] - An institution id to exclude from the
   *   collision check (used during updates, so a record does not conflict with itself).
   * @throws {Boom} - A conflict error describing which field collided.
   * @returns {Promise<void>}
   */
  async _assertUniqueFields({ name, institutionalCode, nitId }, excludedInstitutionId = null) {

    if (name) {
      const institutionWithSameName = await this._findByName(name);
      if (institutionWithSameName && institutionWithSameName.id !== excludedInstitutionId) {
        throw Boom.conflict('An institution already exists with the provided name');
      }
    }

    if (institutionalCode) {
      const institutionWithSameCode = await this._findByInstitutionalCode(institutionalCode);
      if (institutionWithSameCode && institutionWithSameCode.id !== excludedInstitutionId) {
        throw Boom.conflict('An institution already exists with the provided institutional code');
      }
    }

    if (nitId) {
      const institutionWithSameNit = await this._findByNit(nitId);
      if (institutionWithSameNit && institutionWithSameNit.id !== excludedInstitutionId) {
        throw Boom.conflict('An institution already exists with the provided NIT');
      }
    }
  }

  /**
   * Ensures an institution has no associated certificates before
   * allowing its deletion, since 'certificado' references 'institucion'
   * with onDelete: 'RESTRICT' at the database level.
   *
   * @private
   * @param {number} institutionId - The id of the institution to check.
   * @throws {Boom} - A conflict error when dependent certificates exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedCertificates(institutionId) {
    const associatedCertificate = await Certificate.findOne({
      where: { institutionId }
    });

    if (associatedCertificate) {
      throw Boom.conflict('The institution cannot be deleted because it has associated certificates');
    }
  }

  /**
   * Ensures an institution has no associated groups before allowing its
   * deletion. This is a business-rule guard rather than a hard database
   * constraint, since 'grupo' references 'institucion' with
   * onDelete: 'SET NULL'.
   *
   * @private
   * @param {number} institutionId - The id of the institution to check.
   * @throws {Boom} - A conflict error when dependent groups exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedGroups(institutionId) {
    const associatedGroup = await Group.findOne({
      where: { institutionId }
    });

    if (associatedGroup) {
      throw Boom.conflict('The institution cannot be deleted because it has associated groups');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data, and are
  // therefore exposed as static methods (callable as
  // InstitutionServices.normalizeText(...) without instantiating the class).
  // ==========================================================

  /**
   * Normalizes a text field (name, institutional code, or NIT) to the
   * format expected by its RegEx and stored in the database (trimmed,
   * so accidental leading/trailing whitespace never creates a
   * near-duplicate entry or breaks a unique constraint check).
   *
   * @static
   * @param {string} value - The raw text value to normalize.
   * @returns {string} - The normalized text value.
   */
  static normalizeText(value) {
    return value.trim();
  }
}

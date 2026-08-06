// Import the Department data model
import { Department } from '../db/models/department.js';
// Import the Municipality model to enforce the delete-guard business rule
import { Municipality } from '../db/models/municipality.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Department (departamento) entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * Note: the 'departamento' table itself does not carry a unique
 * database constraint on 'nombre_departamento' (see
 * migrations/20260707180143-department.cjs), only the foreign key to
 * 'pais'. To prevent accidental duplicate entries (e.g. registering
 * 'Antioquia' twice under Colombia), this service enforces name
 * uniqueness scoped to the parent country as a business rule at the
 * service layer, per AGENTS.md section 6 ('Antes de mutar datos, se
 * valida la existencia/condición previa').
 */
export class DepartmentServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new department record in the database.
   *
   * @param {Object} newDepartment
   * @param {string} newDepartment.name
   * @param {number} newDepartment.countryId
   * @returns {Promise<{status: string}>}
   */
  async createOne(newDepartment) {

    try {

      // Normalize the name before persisting it (trim surrounding whitespace)
      const normalizedName = DepartmentServices.formatName(newDepartment.name);

      // Verify a department with the same name does not already exist
      // for the given country
      const existingDepartment = await this._findByNameAndCountry(normalizedName, newDepartment.countryId);

      if (existingDepartment) {
        throw Boom.conflict('A department with the provided name already exists for that country');
      }

      // Create the record (id is generated automatically)
      await Department.create({
        name: normalizedName,
        countryId: newDepartment.countryId,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to create the department in the database'
      });
    }
  }

  /**
   * Updates an existing department record.
   *
   * @param {number} departmentId - The id of the department to update.
   * @param {Object} newDepartmentData - The new data to persist.
   * @param {string} [newDepartmentData.name] - The new department name.
   * @param {number} [newDepartmentData.countryId] - The new parent country id.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(departmentId, newDepartmentData) {

    if (!newDepartmentData) {
      throw Boom.badRequest('No data was provided to update');
    }

    try {
      // Verify the department exists before attempting the update
      const existingDepartment = await this._findById(departmentId);

      if (!existingDepartment) {
        throw Boom.notFound('Department not found');
      }

      // Normalize the name before persisting it, when provided
      const normalizedName = newDepartmentData.name
        ? DepartmentServices.formatName(newDepartmentData.name)
        : newDepartmentData.name;

      // If the name and/or the parent country changes, verify the
      // resulting combination is not already used by another department
      if (normalizedName || newDepartmentData.countryId) {
        const departmentWithSameKey = await this._findByNameAndCountry(
          normalizedName ?? existingDepartment.name,
          newDepartmentData.countryId ?? existingDepartment.countryId
        );

        if (departmentWithSameKey && departmentWithSameKey.id !== departmentId) {
          throw Boom.conflict('Another department already exists with that name for that country');
        }
      }

      // Update the record in the database
      const [updatedRows] = await Department.update(
        {
          name: normalizedName,
          countryId: newDepartmentData.countryId,
        },
        {
          where: { id: departmentId }
        }
      );

      // If no rows were updated, return an error
      if (!updatedRows) {
        throw Boom.notFound('Department not found');
      }

      // Return a success response
      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to update the department in the database' });
    }
  }

  /**
   * Deletes a department record, provided it has no associated municipalities.
   *
   * @param {number} departmentId - The id of the department to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(departmentId) {

    if (!departmentId) {
      throw Boom.badRequest('No department identifier was provided');
    }

    try {
      // Verify the department exists before attempting the deletion
      const existingDepartment = await this._findById(departmentId);

      if (!existingDepartment) {
        throw Boom.notFound('Department not found');
      }

      // Prevent deletion if the department still has associated
      // municipalities, giving a clearer error than the raw RESTRICT
      // constraint from MySQL
      await this._assertNoAssociatedMunicipalities(departmentId);

      // Destroy the record in the database
      const deletedRows = await Department.destroy({
        where: { id: departmentId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Department not found');
      }

      // Return a success response
      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to delete the department from the database' });
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
      throw Boom.badRequest('No department identifier was provided');
    }

    try {
      const theDepartment = await this._findById(departmentId);

      if (!theDepartment) {
        throw Boom.notFound('Department not found');
      }

      return theDepartment;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the department' });
    }
  }

  /**
   * Retrieves all department records, ordered alphabetically by name.
   *
   * @returns {Promise<Department[]>} - The list of department records.
   */
  async listAll() {

    try {
      const allDepartments = await Department.findAll({
        order: [['name', 'ASC']]
      });

      return allDepartments;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the departments' });
    }
  }

  /**
   * Searches departments whose name partially matches the given text.
   * Supports the multi-criteria search requirement described in
   * context.md (e.g. 'Nombre parcial').
   *
   * @param {string} partialName - The partial name to search for.
   * @returns {Promise<Department[]>} - The matching department records.
   */
  async listByPartialName(partialName) {

    if (!partialName) {
      throw Boom.badRequest('No search text was provided');
    }

    try {
      const matchingDepartments = await Department.findAll({
        where: {
          name: { [Op.like]: `%${partialName}%` }
        },
        order: [['name', 'ASC']]
      });

      return matchingDepartments;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to search the departments' });
    }
  }

  /**
   * Retrieves all departments belonging to a given country. Useful for
   * cascading selects in the UI (e.g. country -> department -> municipality).
   *
   * @param {number} countryId - The id of the country.
   * @returns {Promise<Department[]>} - The matching department records.
   */
  async listByCountry(countryId) {

    if (!countryId) {
      throw Boom.badRequest('No country identifier was provided');
    }

    try {
      const departmentsByCountry = await Department.findAll({
        where: { countryId },
        order: [['name', 'ASC']]
      });

      return departmentsByCountry;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the departments for the given country' });
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
   * Finds a department by its name, scoped to a specific country. This
   * mirrors the business-level uniqueness rule described in the class
   * JSDoc, since the database itself does not enforce it.
   *
   * @private
   * @param {string} name - The department name to find.
   * @param {number} countryId - The id of the parent country.
   * @returns {Promise<Department|null>} - The department record, or null if not found.
   */
  async _findByNameAndCountry(name, countryId) {
    return Department.findOne({ where: { name, countryId } });
  }

  /**
   * Ensures a department has no associated municipalities before
   * allowing its deletion, since 'municipio' references 'departamento'
   * with onDelete: 'RESTRICT' at the database level.
   *
   * @private
   * @param {number} departmentId - The id of the department to check.
   * @throws {Boom} - A conflict error when dependent municipalities exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedMunicipalities(departmentId) {
    const associatedMunicipality = await Municipality.findOne({
      where: { departmentId }
    });

    if (associatedMunicipality) {
      throw Boom.conflict('The department cannot be deleted because it has associated municipalities');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data, and are
  // therefore exposed as static methods (callable as
  // DepartmentServices.formatName(...) without instantiating the class).
  // ==========================================================

  /**
   * Normalizes a department name to the format expected by the
   * departmentName RegEx and stored in the database (trimmed, so
   * accidental leading/trailing whitespace never creates a
   * near-duplicate entry).
   *
   * @static
   * @param {string} name - The raw department name to normalize.
   * @returns {string} - The normalized department name.
   */
  static formatName(name) {
    return name.trim();
  }
}

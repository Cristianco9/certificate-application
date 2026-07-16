// Import the Group data model
import { Group } from '../db/models/group.js';
// Import the Enrollment model to enforce the delete-guard business rule
import { Enrollment } from '../db/models/enrollment.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Group (grupo) entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 */
export class GroupServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new group record in the database.
   *
   * @param {Object} newGroup
   * @param {string} newGroup.name
   * @param {number} newGroup.year
   * @param {number} [newGroup.gradeId]
   * @param {string} newGroup.shift - 'DIURNA' or 'NOCTURNA'
   * @param {number} [newGroup.institutionId]
   * @param {string} newGroup.status - 'ACTIVO' or 'INACTIVO'
   * @returns {Promise<{status: string}>}
   */
  async createOne(newGroup) {

    try {

      // Validate the academic year range before touching the database
      GroupServices._assertValidYear(newGroup.year);

      // Verify a group with the same composite key does not already exist
      // (name + year + grade + institution must be unique together)
      const existingGroup = await this._findByCompositeKey(
        newGroup.name,
        newGroup.year,
        newGroup.gradeId,
        newGroup.institutionId
      );

      if (existingGroup) {
        throw Boom.conflict('A group with the same name, year, grade and institution already exists');
      }

      // Create the record (id is generated automatically)
      await Group.create({
        name: newGroup.name,
        year: newGroup.year,
        gradeId: newGroup.gradeId,
        shift: newGroup.shift,
        institutionId: newGroup.institutionId,
        status: newGroup.status,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to create the group in the database'
      });
    }
  }

  /**
   * Updates an existing group record.
   *
   * @param {number} groupId - The id of the group to update.
   * @param {Object} newGroupData - The new data to persist.
   * @param {string} [newGroupData.name] - The new group name.
   * @param {number} [newGroupData.year] - The new academic year.
   * @param {number} [newGroupData.gradeId] - The new grade id.
   * @param {string} [newGroupData.shift] - The new school day shift.
   * @param {number} [newGroupData.institutionId] - The new institution id.
   * @param {string} [newGroupData.status] - The new group status.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(groupId, newGroupData) {

    if (!newGroupData) {
      throw Boom.badRequest('No data was provided to update');
    }

    try {
      // Verify the group exists before attempting the update
      const existingGroup = await this._findById(groupId);

      if (!existingGroup) {
        throw Boom.notFound('Group not found');
      }

      // Validate the academic year range, when provided
      if (newGroupData.year) {
        GroupServices._assertValidYear(newGroupData.year);
      }

      // If any part of the composite key changes, verify the resulting
      // combination is not already used by another group
      const composesUniqueKeyChange = ['name', 'year', 'gradeId', 'institutionId']
        .some((field) => Object.prototype.hasOwnProperty.call(newGroupData, field));

      if (composesUniqueKeyChange) {
        const groupWithSameKey = await this._findByCompositeKey(
          newGroupData.name ?? existingGroup.name,
          newGroupData.year ?? existingGroup.year,
          newGroupData.gradeId ?? existingGroup.gradeId,
          newGroupData.institutionId ?? existingGroup.institutionId
        );

        if (groupWithSameKey && groupWithSameKey.id !== groupId) {
          throw Boom.conflict('Another group already exists with that same name, year, grade and institution');
        }
      }

      // Update the record in the database
      const [updatedRows] = await Group.update(
        {
          name: newGroupData.name,
          year: newGroupData.year,
          gradeId: newGroupData.gradeId,
          shift: newGroupData.shift,
          institutionId: newGroupData.institutionId,
          status: newGroupData.status,
        },
        {
          where: { id: groupId }
        }
      );

      // If no rows were updated, return an error
      if (!updatedRows) {
        throw Boom.notFound('Group not found');
      }

      // Return a success response
      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to update the group in the database' });
    }
  }

  /**
   * Deletes a group record, provided it has no associated enrollments.
   * Although 'matricula' references 'grupo' with onDelete: 'SET NULL'
   * (so the database itself would not block this operation), deleting
   * a group that still has active enrollments would silently orphan
   * that academic history. This business rule enforces the safer
   * behavior of requiring enrollments to be reassigned first.
   *
   * @param {number} groupId - The id of the group to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(groupId) {

    if (!groupId) {
      throw Boom.badRequest('No group identifier was provided');
    }

    try {
      // Verify the group exists before attempting the deletion
      const existingGroup = await this._findById(groupId);

      if (!existingGroup) {
        throw Boom.notFound('Group not found');
      }

      // Prevent deletion if the group still has associated enrollments
      await this._assertNoAssociatedEnrollments(groupId);

      // Destroy the record in the database
      const deletedRows = await Group.destroy({
        where: { id: groupId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Group not found');
      }

      // Return a success response
      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to delete the group from the database' });
    }
  }

  /**
   * Retrieves a single group by its id.
   *
   * @param {number} groupId - The id of the group to retrieve.
   * @returns {Promise<Group>} - The group record.
   */
  async listOne(groupId) {

    if (!groupId) {
      throw Boom.badRequest('No group identifier was provided');
    }

    try {
      const theGroup = await this._findById(groupId);

      if (!theGroup) {
        throw Boom.notFound('Group not found');
      }

      return theGroup;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the group' });
    }
  }

  /**
   * Retrieves all group records, ordered by academic year (descending)
   * and then alphabetically by name.
   *
   * @returns {Promise<Group[]>} - The list of group records.
   */
  async listAll() {

    try {
      const allGroups = await Group.findAll({
        order: [['year', 'DESC'], ['name', 'ASC']]
      });

      return allGroups;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the groups' });
    }
  }

  /**
   * Searches groups whose name partially matches the given text.
   * Supports the multi-criteria search requirement described in
   * context.md (e.g. 'Nombre parcial', 'Combinación de filtros').
   *
   * @param {string} partialName - The partial name to search for.
   * @returns {Promise<Group[]>} - The matching group records.
   */
  async listByPartialName(partialName) {

    if (!partialName) {
      throw Boom.badRequest('No search text was provided');
    }

    try {
      const matchingGroups = await Group.findAll({
        where: {
          name: { [Op.like]: `%${partialName}%` }
        },
        order: [['year', 'DESC'], ['name', 'ASC']]
      });

      return matchingGroups;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to search the groups' });
    }
  }

  /**
   * Retrieves all groups belonging to a given institution.
   * Supports the 'Grupo' search criterion described in context.md.
   *
   * @param {number} institutionId - The id of the institution.
   * @returns {Promise<Group[]>} - The matching group records.
   */
  async listByInstitution(institutionId) {

    if (!institutionId) {
      throw Boom.badRequest('No institution identifier was provided');
    }

    try {
      const groupsByInstitution = await Group.findAll({
        where: { institutionId },
        order: [['year', 'DESC'], ['name', 'ASC']]
      });

      return groupsByInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the groups for the given institution' });
    }
  }

  /**
   * Retrieves all groups matching a given grade and academic year.
   * Supports the 'Combinación de filtros' search requirement
   * described in context.md (Grado + Año).
   *
   * @param {number} gradeId - The id of the grade.
   * @param {number} year - The academic year.
   * @returns {Promise<Group[]>} - The matching group records.
   */
  async listByGradeAndYear(gradeId, year) {

    if (!gradeId || !year) {
      throw Boom.badRequest('Both grade and year must be provided');
    }

    try {
      const groupsByGradeAndYear = await Group.findAll({
        where: { gradeId, year },
        order: [['name', 'ASC']]
      });

      return groupsByGradeAndYear;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the groups for the given grade and year' });
    }
  }

  /**
   * Changes the status of a group (e.g. ACTIVO / INACTIVO). Exposed as
   * a dedicated business method, rather than relying on the generic
   * updateOne, since activating/deactivating a group is a distinct
   * operational action in the domain (see context.md, 'estado_grupo').
   *
   * @param {number} groupId - The id of the group to update.
   * @param {string} newStatus - The new status ('ACTIVO' or 'INACTIVO').
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async changeStatus(groupId, newStatus) {

    if (!groupId) {
      throw Boom.badRequest('No group identifier was provided');
    }

    if (!['ACTIVO', 'INACTIVO'].includes(newStatus)) {
      throw Boom.badRequest('The status must be either ACTIVO or INACTIVO');
    }

    try {
      const existingGroup = await this._findById(groupId);

      if (!existingGroup) {
        throw Boom.notFound('Group not found');
      }

      await Group.update(
        { status: newStatus },
        { where: { id: groupId } }
      );

      return { status: 'STATUS UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to update the group status' });
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
   * Finds a group by its primary key.
   *
   * @private
   * @param {number} groupId - The id of the group to find.
   * @returns {Promise<Group|null>} - The group record, or null if not found.
   */
  async _findById(groupId) {
    return Group.findOne({ where: { id: groupId } });
  }

  /**
   * Finds a group by its composite unique key (name + year + grade +
   * institution), mirroring the 'grupo_nombre_anio_grado_institucion_unique'
   * database index.
   *
   * @private
   * @param {string} name - The group name.
   * @param {number} year - The academic year.
   * @param {number} gradeId - The grade id.
   * @param {number} institutionId - The institution id.
   * @returns {Promise<Group|null>} - The group record, or null if not found.
   */
  async _findByCompositeKey(name, year, gradeId, institutionId) {
    return Group.findOne({
      where: { name, year, gradeId, institutionId }
    });
  }

  /**
   * Ensures a group has no associated enrollments before allowing its
   * deletion. This is a business-rule guard rather than a hard database
   * constraint, since 'matricula' references 'grupo' with
   * onDelete: 'SET NULL'.
   *
   * @private
   * @param {number} groupId - The id of the group to check.
   * @throws {Boom} - A conflict error when dependent enrollments exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedEnrollments(groupId) {
    const associatedEnrollment = await Enrollment.findOne({
      where: { groupId }
    });

    if (associatedEnrollment) {
      throw Boom.conflict('The group cannot be deleted because it has associated enrollments');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data, and are
  // therefore exposed as static methods (callable as
  // GroupServices.method(...) without instantiating the class).
  // A leading underscore is used on the ones intended strictly for
  // internal use within this class (mirroring the instance-method
  // privacy convention), since ecmaVersion 12 (ES2021) does not
  // support true private static members without '#' fields.
  // ==========================================================

  /**
   * Validates that the academic year falls within MySQL's native YEAR
   * range (1901-2155), compensating for the fact that 'year' is mapped
   * as a plain INTEGER at the Sequelize level (see the comment in
   * models/group.js).
   *
   * @private
   * @static
   * @param {number} year - The academic year to validate.
   * @throws {Boom} - A bad request error when the year is out of range.
   * @returns {void}
   */
  static _assertValidYear(year) {
    if (year < 1901 || year > 2155) {
      throw Boom.badRequest('The academic year must be between 1901 and 2155');
    }
  }
}

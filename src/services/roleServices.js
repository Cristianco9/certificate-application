// Import the Role data model
import { Role } from '../db/models/role.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Role entity.
 *
 * Role is a small catalog table (fixed ENUM of values at the database
 * level) used to authorize Users, per the 'Configurar parámetros' and
 * 'Gestionar roles' responsibilities of the Administrador role
 * described in context.md. It still exposes full CRUD so an
 * administrator can manage it from the configuration screens.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class.
 */
export class RoleServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new role record in the database.
   *
   * @param {Object} newRole - The role data to be created.
   * @param {string} newRole.name - The role name (must match one of the values defined in the 'rol' ENUM column).
   * @param {string} newRole.description - The role description.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newRole) {

    try {
      // Verify a role with the same name does not already exist
      const existingRoleByName = await this._findByName(newRole.name);

      if (existingRoleByName) {
        throw Boom.conflict('El rol ya existe con el nombre proporcionado');
      }

      // Create the new record in the database. The id is autoIncrement
      // at the database level, so it is never passed explicitly here.
      await Role.create({
        name: RoleServices.normalizeName(newRole.name),
        description: newRole.description,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el rol en la base de datos' });
    }
  }

  /**
   * Updates an existing role record.
   *
   * @param {number} roleId - The id of the role to update.
   * @param {Object} newRoleData - The new data to persist.
   * @param {string} [newRoleData.name] - The new role name.
   * @param {string} [newRoleData.description] - The new role description.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(roleId, newRoleData) {

    if (!newRoleData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingRole = await this._findById(roleId);

      if (!existingRole) {
        throw Boom.notFound('Rol no encontrado');
      }

      if (newRoleData.name) {
        const roleWithSameName = await this._findByName(newRoleData.name);

        if (roleWithSameName && roleWithSameName.id !== roleId) {
          throw Boom.conflict('Ya existe otro rol registrado con ese nombre');
        }
      }

      const [updatedRows] = await Role.update(
        {
          name: newRoleData.name ? RoleServices.normalizeName(newRoleData.name) : newRoleData.name,
          description: newRoleData.description,
        },
        {
          where: { id: roleId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Rol no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el rol en la base de datos' });
    }
  }

  /**
   * Deletes a role record, provided it has no dependent users.
   *
   * @param {number} roleId - The id of the role to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(roleId) {

    if (!roleId) {
      throw Boom.badRequest('No se proporcionó el identificador del rol');
    }

    try {
      const existingRole = await this._findById(roleId);

      if (!existingRole) {
        throw Boom.notFound('Rol no encontrado');
      }

      // Prevent deletion if the role still has associated users,
      // giving a clearer error than the raw RESTRICT constraint from MySQL
      await this._assertNoAssociatedUsers(roleId);

      const deletedRows = await Role.destroy({
        where: { id: roleId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Rol no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el rol de la base de datos' });
    }
  }

  /**
   * Retrieves a single role by its id.
   *
   * @param {number} roleId - The id of the role to retrieve.
   * @returns {Promise<Role>} - The role record.
   */
  async listOne(roleId) {

    if (!roleId) {
      throw Boom.badRequest('No se proporcionó el identificador del rol');
    }

    try {
      const theRole = await this._findById(roleId);

      if (!theRole) {
        throw Boom.notFound('Rol no encontrado');
      }

      return theRole;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el rol' });
    }
  }

  /**
   * Retrieves all role records, ordered alphabetically by name.
   *
   * @returns {Promise<Role[]>} - The list of role records.
   */
  async listAll() {

    try {
      return await Role.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los roles' });
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
   * Finds a role by its primary key.
   *
   * @private
   * @param {number} roleId - The id of the role to find.
   * @returns {Promise<Role|null>} - The role record, or null if not found.
   */
  async _findById(roleId) {
    return Role.findOne({ where: { id: roleId } });
  }

  /**
   * Finds a role by its exact name.
   *
   * @private
   * @param {string} name - The role name to find.
   * @returns {Promise<Role|null>} - The role record, or null if not found.
   */
  async _findByName(name) {
    return Role.findOne({ where: { name } });
  }

  /**
   * Ensures a role has no associated users before allowing its
   * deletion, since 'usuario' references 'rol' with onDelete:
   * 'RESTRICT'.
   *
   * @private
   * @param {number} roleId - The id of the role to check.
   * @throws {Boom} - A conflict error when dependent users exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedUsers(roleId) {
    const roleWithUsers = await Role.findOne({
      where: { id: roleId },
      include: [{ association: 'users', required: true }]
    });

    if (roleWithUsers) {
      throw Boom.conflict('No es posible eliminar el rol porque tiene usuarios asociados');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes a role name by trimming surrounding whitespace, without
   * altering case or accents, since the value must match exactly one of
   * the options defined in the database ENUM.
   *
   * @static
   * @param {string} name - The raw name to normalize.
   * @returns {string} - The normalized name.
   */
  static normalizeName(name) {
    return name.trim();
  }
}

// Import the Gender data model
import { Gender } from '../db/models/gender.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Gender entity.
 *
 * Gender is a small catalog table (fixed ENUM of values at the database
 * level) used mainly to parametrize Student and User records, per the
 * 'Configurar parámetros' responsibility of the Administrador role
 * described in context.md. It still exposes full CRUD so an
 * administrator can manage it from the configuration screens.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class.
 */
export class GenderServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new gender record in the database.
   *
   * @param {Object} newGender - The gender data to be created.
   * @param {string} newGender.name - The gender name (must match one of the values defined in the 'genero' ENUM column).
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newGender) {

    try {
      // Verify a gender with the same name does not already exist
      const existingGenderByName = await this._findByName(newGender.name);

      if (existingGenderByName) {
        throw Boom.conflict('El género ya existe con el nombre proporcionado');
      }

      // Create the new record in the database. The id is autoIncrement
      // at the database level, so it is never passed explicitly here.
      await Gender.create({
        name: GenderServices.normalizeName(newGender.name),
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el género en la base de datos' });
    }
  }

  /**
   * Updates an existing gender record.
   *
   * @param {number} genderId - The id of the gender to update.
   * @param {Object} newGenderData - The new data to persist.
   * @param {string} newGenderData.name - The new gender name.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(genderId, newGenderData) {

    if (!newGenderData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingGender = await this._findById(genderId);

      if (!existingGender) {
        throw Boom.notFound('Género no encontrado');
      }

      if (newGenderData.name) {
        const genderWithSameName = await this._findByName(newGenderData.name);

        if (genderWithSameName && genderWithSameName.id !== genderId) {
          throw Boom.conflict('Ya existe otro género registrado con ese nombre');
        }
      }

      const [updatedRows] = await Gender.update(
        {
          name: newGenderData.name ? GenderServices.normalizeName(newGenderData.name) : newGenderData.name,
        },
        {
          where: { id: genderId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Género no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el género en la base de datos' });
    }
  }

  /**
   * Deletes a gender record, provided it has no dependent users. The
   * relationship with Student uses SET NULL and therefore never blocks
   * the deletion.
   *
   * @param {number} genderId - The id of the gender to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(genderId) {

    if (!genderId) {
      throw Boom.badRequest('No se proporcionó el identificador del género');
    }

    try {
      const existingGender = await this._findById(genderId);

      if (!existingGender) {
        throw Boom.notFound('Género no encontrado');
      }

      // Prevent deletion if the gender still has associated users,
      // giving a clearer error than the raw RESTRICT constraint from MySQL
      await this._assertNoAssociatedUsers(genderId);

      const deletedRows = await Gender.destroy({
        where: { id: genderId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Género no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el género de la base de datos' });
    }
  }

  /**
   * Retrieves a single gender by its id.
   *
   * @param {number} genderId - The id of the gender to retrieve.
   * @returns {Promise<Gender>} - The gender record.
   */
  async listOne(genderId) {

    if (!genderId) {
      throw Boom.badRequest('No se proporcionó el identificador del género');
    }

    try {
      const theGender = await this._findById(genderId);

      if (!theGender) {
        throw Boom.notFound('Género no encontrado');
      }

      return theGender;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el género' });
    }
  }

  /**
   * Retrieves all gender records, ordered alphabetically by name.
   *
   * @returns {Promise<Gender[]>} - The list of gender records.
   */
  async listAll() {

    try {
      return await Gender.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los géneros' });
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
   * Finds a gender by its primary key.
   *
   * @private
   * @param {number} genderId - The id of the gender to find.
   * @returns {Promise<Gender|null>} - The gender record, or null if not found.
   */
  async _findById(genderId) {
    return Gender.findOne({ where: { id: genderId } });
  }

  /**
   * Finds a gender by its exact name.
   *
   * @private
   * @param {string} name - The gender name to find.
   * @returns {Promise<Gender|null>} - The gender record, or null if not found.
   */
  async _findByName(name) {
    return Gender.findOne({ where: { name } });
  }

  /**
   * Ensures a gender has no associated users before allowing its
   * deletion, since 'usuario' references 'genero' with onDelete:
   * 'RESTRICT'.
   *
   * @private
   * @param {number} genderId - The id of the gender to check.
   * @throws {Boom} - A conflict error when dependent users exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedUsers(genderId) {
    const genderWithUsers = await Gender.findOne({
      where: { id: genderId },
      include: [{ association: 'users', required: true }]
    });

    if (genderWithUsers) {
      throw Boom.conflict('No es posible eliminar el género porque tiene usuarios asociados');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes a gender name by trimming surrounding whitespace, without
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

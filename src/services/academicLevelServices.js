// Import the AcademicLevel data model
import { AcademicLevel } from '../db/models/academicLevel.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the AcademicLevel entity.
 *
 * AcademicLevel is a small catalog table (fixed ENUM of values at the
 * database level) used to parametrize User records, per the
 * 'Configurar parámetros' responsibility of the Administrador role
 * described in context.md. It still exposes full CRUD so an
 * administrator can manage it from the configuration screens.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class.
 */
export class AcademicLevelServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new academic level record in the database.
   *
   * @param {Object} newAcademicLevel - The academic level data to be created.
   * @param {string} newAcademicLevel.name - The academic level name (must match one of the values defined in the 'nivel_academico' ENUM column).
   * @param {string} newAcademicLevel.abbreviation - The academic level abbreviation (must match one of the values defined in the corresponding ENUM column).
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newAcademicLevel) {

    try {
      // Verify an academic level with the same name does not already exist
      const existingAcademicLevelByName = await this._findByName(newAcademicLevel.name);

      if (existingAcademicLevelByName) {
        throw Boom.conflict('El nivel académico ya existe con el nombre proporcionado');
      }

      // Verify an academic level with the same abbreviation does not already exist
      const existingAcademicLevelByAbbreviation = await this._findByAbbreviation(newAcademicLevel.abbreviation);

      if (existingAcademicLevelByAbbreviation) {
        throw Boom.conflict('El nivel académico ya existe con la abreviatura proporcionada');
      }

      // Create the new record in the database. The id is autoIncrement
      // at the database level, so it is never passed explicitly here.
      await AcademicLevel.create({
        name: AcademicLevelServices.normalizeName(newAcademicLevel.name),
        abbreviation: AcademicLevelServices.normalizeAbbreviation(newAcademicLevel.abbreviation),
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el nivel académico en la base de datos' });
    }
  }

  /**
   * Updates an existing academic level record.
   *
   * @param {number} academicLevelId - The id of the academic level to update.
   * @param {Object} newAcademicLevelData - The new data to persist.
   * @param {string} [newAcademicLevelData.name] - The new academic level name.
   * @param {string} [newAcademicLevelData.abbreviation] - The new academic level abbreviation.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(academicLevelId, newAcademicLevelData) {

    if (!newAcademicLevelData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingAcademicLevel = await this._findById(academicLevelId);

      if (!existingAcademicLevel) {
        throw Boom.notFound('Nivel académico no encontrado');
      }

      if (newAcademicLevelData.name) {
        const academicLevelWithSameName = await this._findByName(newAcademicLevelData.name);

        if (academicLevelWithSameName && academicLevelWithSameName.id !== academicLevelId) {
          throw Boom.conflict('Ya existe otro nivel académico registrado con ese nombre');
        }
      }

      if (newAcademicLevelData.abbreviation) {
        const academicLevelWithSameAbbreviation = await this._findByAbbreviation(newAcademicLevelData.abbreviation);

        if (academicLevelWithSameAbbreviation && academicLevelWithSameAbbreviation.id !== academicLevelId) {
          throw Boom.conflict('Ya existe otro nivel académico registrado con esa abreviatura');
        }
      }

      const [updatedRows] = await AcademicLevel.update(
        {
          name: newAcademicLevelData.name
            ? AcademicLevelServices.normalizeName(newAcademicLevelData.name)
            : newAcademicLevelData.name,
          abbreviation: newAcademicLevelData.abbreviation
            ? AcademicLevelServices.normalizeAbbreviation(newAcademicLevelData.abbreviation)
            : newAcademicLevelData.abbreviation,
        },
        {
          where: { id: academicLevelId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Nivel académico no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el nivel académico en la base de datos' });
    }
  }

  /**
   * Deletes an academic level record, provided it has no dependent users.
   *
   * @param {number} academicLevelId - The id of the academic level to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(academicLevelId) {

    if (!academicLevelId) {
      throw Boom.badRequest('No se proporcionó el identificador del nivel académico');
    }

    try {
      const existingAcademicLevel = await this._findById(academicLevelId);

      if (!existingAcademicLevel) {
        throw Boom.notFound('Nivel académico no encontrado');
      }

      // Prevent deletion if the academic level still has associated
      // users, giving a clearer error than the raw RESTRICT constraint
      // from MySQL
      await this._assertNoAssociatedUsers(academicLevelId);

      const deletedRows = await AcademicLevel.destroy({
        where: { id: academicLevelId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Nivel académico no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el nivel académico de la base de datos' });
    }
  }

  /**
   * Retrieves a single academic level by its id.
   *
   * @param {number} academicLevelId - The id of the academic level to retrieve.
   * @returns {Promise<AcademicLevel>} - The academic level record.
   */
  async listOne(academicLevelId) {

    if (!academicLevelId) {
      throw Boom.badRequest('No se proporcionó el identificador del nivel académico');
    }

    try {
      const theAcademicLevel = await this._findById(academicLevelId);

      if (!theAcademicLevel) {
        throw Boom.notFound('Nivel académico no encontrado');
      }

      return theAcademicLevel;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el nivel académico' });
    }
  }

  /**
   * Retrieves all academic level records, ordered alphabetically by name.
   *
   * @returns {Promise<AcademicLevel[]>} - The list of academic level records.
   */
  async listAll() {

    try {
      return await AcademicLevel.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los niveles académicos' });
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
   * Finds an academic level by its primary key.
   *
   * @private
   * @param {number} academicLevelId - The id of the academic level to find.
   * @returns {Promise<AcademicLevel|null>} - The academic level record, or null if not found.
   */
  async _findById(academicLevelId) {
    return AcademicLevel.findOne({ where: { id: academicLevelId } });
  }

  /**
   * Finds an academic level by its exact name.
   *
   * @private
   * @param {string} name - The academic level name to find.
   * @returns {Promise<AcademicLevel|null>} - The academic level record, or null if not found.
   */
  async _findByName(name) {
    return AcademicLevel.findOne({ where: { name } });
  }

  /**
   * Finds an academic level by its exact abbreviation.
   *
   * @private
   * @param {string} abbreviation - The academic level abbreviation to find.
   * @returns {Promise<AcademicLevel|null>} - The academic level record, or null if not found.
   */
  async _findByAbbreviation(abbreviation) {
    return AcademicLevel.findOne({ where: { abbreviation } });
  }

  /**
   * Ensures an academic level has no associated users before allowing
   * its deletion, since 'usuario' references 'nivel_academico' with
   * onDelete: 'RESTRICT'.
   *
   * @private
   * @param {number} academicLevelId - The id of the academic level to check.
   * @throws {Boom} - A conflict error when dependent users exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedUsers(academicLevelId) {
    const academicLevelWithUsers = await AcademicLevel.findOne({
      where: { id: academicLevelId },
      include: [{ association: 'users', required: true }]
    });

    if (academicLevelWithUsers) {
      throw Boom.conflict('No es posible eliminar el nivel académico porque tiene usuarios asociados');
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes an academic level name by trimming surrounding
   * whitespace, without altering case or accents, since the value must
   * match exactly one of the options defined in the database ENUM.
   *
   * @static
   * @param {string} name - The raw name to normalize.
   * @returns {string} - The normalized name.
   */
  static normalizeName(name) {
    return name.trim();
  }

  /**
   * Normalizes an academic level abbreviation by trimming surrounding
   * whitespace, without altering case, since the value must match
   * exactly one of the options defined in the database ENUM
   * (e.g. 'Téc', 'Tgo', 'Lic', 'Esp', 'Mgs', 'Ph.D').
   *
   * @static
   * @param {string} abbreviation - The raw abbreviation to normalize.
   * @returns {string} - The normalized abbreviation.
   */
  static normalizeAbbreviation(abbreviation) {
    return abbreviation.trim();
  }
}

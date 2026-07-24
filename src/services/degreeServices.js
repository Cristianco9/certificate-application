// Import the Grade data model (table 'grado')
import { Grade } from '../db/models/grade.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Grade entity (referred to as 'Degree' in
 * this project's service layer naming).
 *
 * Grade is a small catalog table (fixed ENUM of values at the database
 * level) used to parametrize Group records, per the 'Configurar
 * parámetros' responsibility of the Administrador role described in
 * context.md. It still exposes full CRUD so an administrator can
 * manage it from the configuration screens.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. The primary key is AUTO_INCREMENT and fully managed by
 * MySQL/Sequelize, so it is never requested, validated, or passed into
 * Grade.create() — see the mandatory createOne rule for this project.
 */
export class DegreeServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new grade record in the database.
   *
   * @param {Object} newDegree - The grade data to be created.
   * @param {string} newDegree.name - The grade name (must match one of the values defined in the 'grado' ENUM column).
   * @param {string} newDegree.description - The grade description.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newDegree) {

    try {
      // Verify a grade with the same name does not already exist.
      // Duplicate checks are performed only over business attributes,
      // never over the auto-generated id.
      const existingDegreeByName = await this._findByName(newDegree.name);

      if (existingDegreeByName) {
        throw Boom.conflict('El grado ya existe con el nombre proporcionado');
      }

      // Create the new record in the database. The id is AUTO_INCREMENT
      // at the database level, so it is never passed explicitly here.
      await Grade.create({
        name: DegreeServices.normalizeName(newDegree.name),
        description: DegreeServices.normalizeDescription(newDegree.description),
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el grado en la base de datos' });
    }
  }

  /**
   * Updates an existing grade record.
   *
   * @param {number} degreeId - The id of the grade to update.
   * @param {Object} newDegreeData - The new data to persist.
   * @param {string} [newDegreeData.name] - The new grade name.
   * @param {string} [newDegreeData.description] - The new grade description.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(degreeId, newDegreeData) {

    if (!newDegreeData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingDegree = await this._findById(degreeId);

      if (!existingDegree) {
        throw Boom.notFound('Grado no encontrado');
      }

      if (newDegreeData.name) {
        const degreeWithSameName = await this._findByName(newDegreeData.name);

        if (degreeWithSameName && degreeWithSameName.id !== degreeId) {
          throw Boom.conflict('Ya existe otro grado registrado con ese nombre');
        }
      }

      const [updatedRows] = await Grade.update(
        {
          name: newDegreeData.name ? DegreeServices.normalizeName(newDegreeData.name) : newDegreeData.name,
          description: newDegreeData.description
            ? DegreeServices.normalizeDescription(newDegreeData.description)
            : newDegreeData.description,
        },
        {
          where: { id: degreeId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Grado no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el grado en la base de datos' });
    }
  }

  /**
   * Deletes a grade record. The relationship with Group uses SET NULL,
   * so an existing grade can always be removed without a dependent
   * conflict at the database level; groups referencing it simply lose
   * that reference.
   *
   * @param {number} degreeId - The id of the grade to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(degreeId) {

    if (!degreeId) {
      throw Boom.badRequest('No se proporcionó el identificador del grado');
    }

    try {
      const existingDegree = await this._findById(degreeId);

      if (!existingDegree) {
        throw Boom.notFound('Grado no encontrado');
      }

      const deletedRows = await Grade.destroy({
        where: { id: degreeId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Grado no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el grado de la base de datos' });
    }
  }

  /**
   * Retrieves a single grade by its id.
   *
   * @param {number} degreeId - The id of the grade to retrieve.
   * @returns {Promise<Grade>} - The grade record.
   */
  async listOne(degreeId) {

    if (!degreeId) {
      throw Boom.badRequest('No se proporcionó el identificador del grado');
    }

    try {
      const theDegree = await this._findById(degreeId);

      if (!theDegree) {
        throw Boom.notFound('Grado no encontrado');
      }

      return theDegree;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el grado' });
    }
  }

  /**
   * Retrieves all grade records, ordered alphabetically by name.
   *
   * @returns {Promise<Grade[]>} - The list of grade records.
   */
  async listAll() {

    try {
      return await Grade.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los grados' });
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
   * Finds a grade by its primary key.
   *
   * @private
   * @param {number} degreeId - The id of the grade to find.
   * @returns {Promise<Grade|null>} - The grade record, or null if not found.
   */
  async _findById(degreeId) {
    return Grade.findOne({ where: { id: degreeId } });
  }

  /**
   * Finds a grade by its exact name.
   *
   * @private
   * @param {string} name - The grade name to find.
   * @returns {Promise<Grade|null>} - The grade record, or null if not found.
   */
  async _findByName(name) {
    return Grade.findOne({ where: { name } });
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes a grade name by trimming surrounding whitespace, without
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

  /**
   * Normalizes a grade description by trimming surrounding whitespace.
   *
   * @static
   * @param {string} description - The raw description to normalize.
   * @returns {string} - The normalized description.
   */
  static normalizeDescription(description) {
    return description.trim();
  }
}

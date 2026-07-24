// Import the DocumentType data model
import { DocumentType } from '../db/models/documentType.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the DocumentType entity.
 *
 * DocumentType is a small catalog table (fixed ENUM of values at the
 * database level) used to parametrize User, Student and
 * CertificateRecipient records, per the 'Configurar parámetros'
 * responsibility of the Administrador role described in context.md. It
 * still exposes full CRUD so an administrator can manage it from the
 * configuration screens.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class.
 */
export class DocumentTypeServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new document type record in the database.
   *
   * @param {Object} newDocumentType - The document type data to be created.
   * @param {string} newDocumentType.name - The document type name (must match one of the values defined in the 'tipo_documento' ENUM column).
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async createOne(newDocumentType) {

    try {
      // Verify a document type with the same name does not already exist
      const existingDocumentTypeByName = await this._findByName(newDocumentType.name);

      if (existingDocumentTypeByName) {
        throw Boom.conflict('El tipo de documento ya existe con el nombre proporcionado');
      }

      // Create the new record in the database. The id is autoIncrement
      // at the database level, so it is never passed explicitly here.
      await DocumentType.create({
        name: DocumentTypeServices.normalizeName(newDocumentType.name),
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible crear el tipo de documento en la base de datos' });
    }
  }

  /**
   * Updates an existing document type record.
   *
   * @param {number} documentTypeId - The id of the document type to update.
   * @param {Object} newDocumentTypeData - The new data to persist.
   * @param {string} newDocumentTypeData.name - The new document type name.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(documentTypeId, newDocumentTypeData) {

    if (!newDocumentTypeData) {
      throw Boom.badRequest('No se proporcionaron datos para actualizar');
    }

    try {
      const existingDocumentType = await this._findById(documentTypeId);

      if (!existingDocumentType) {
        throw Boom.notFound('Tipo de documento no encontrado');
      }

      if (newDocumentTypeData.name) {
        const documentTypeWithSameName = await this._findByName(newDocumentTypeData.name);

        if (documentTypeWithSameName && documentTypeWithSameName.id !== documentTypeId) {
          throw Boom.conflict('Ya existe otro tipo de documento registrado con ese nombre');
        }
      }

      const [updatedRows] = await DocumentType.update(
        {
          name: newDocumentTypeData.name
            ? DocumentTypeServices.normalizeName(newDocumentTypeData.name)
            : newDocumentTypeData.name,
        },
        {
          where: { id: documentTypeId }
        }
      );

      if (!updatedRows) {
        throw Boom.notFound('Tipo de documento no encontrado');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible actualizar el tipo de documento en la base de datos' });
    }
  }

  /**
   * Deletes a document type record, provided it has no dependent users
   * or certificate recipients. The relationship with Student uses
   * SET NULL and therefore never blocks the deletion.
   *
   * @param {number} documentTypeId - The id of the document type to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(documentTypeId) {

    if (!documentTypeId) {
      throw Boom.badRequest('No se proporcionó el identificador del tipo de documento');
    }

    try {
      const existingDocumentType = await this._findById(documentTypeId);

      if (!existingDocumentType) {
        throw Boom.notFound('Tipo de documento no encontrado');
      }

      // Prevent deletion if the document type still has associated
      // records, giving a clearer error than the raw RESTRICT
      // constraint from MySQL
      await this._assertNoRestrictingDependents(documentTypeId);

      const deletedRows = await DocumentType.destroy({
        where: { id: documentTypeId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Tipo de documento no encontrado');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible eliminar el tipo de documento de la base de datos' });
    }
  }

  /**
   * Retrieves a single document type by its id.
   *
   * @param {number} documentTypeId - The id of the document type to retrieve.
   * @returns {Promise<DocumentType>} - The document type record.
   */
  async listOne(documentTypeId) {

    if (!documentTypeId) {
      throw Boom.badRequest('No se proporcionó el identificador del tipo de documento');
    }

    try {
      const theDocumentType = await this._findById(documentTypeId);

      if (!theDocumentType) {
        throw Boom.notFound('Tipo de documento no encontrado');
      }

      return theDocumentType;

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar el tipo de documento' });
    }
  }

  /**
   * Retrieves all document type records, ordered alphabetically by name.
   *
   * @returns {Promise<DocumentType[]>} - The list of document type records.
   */
  async listAll() {

    try {
      return await DocumentType.findAll({ order: [['name', 'ASC']] });

    } catch (error) {
      throw Boom.boomify(error, { message: 'No es posible encontrar los tipos de documento' });
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
   * Finds a document type by its primary key.
   *
   * @private
   * @param {number} documentTypeId - The id of the document type to find.
   * @returns {Promise<DocumentType|null>} - The document type record, or null if not found.
   */
  async _findById(documentTypeId) {
    return DocumentType.findOne({ where: { id: documentTypeId } });
  }

  /**
   * Finds a document type by its exact name.
   *
   * @private
   * @param {string} name - The document type name to find.
   * @returns {Promise<DocumentType|null>} - The document type record, or null if not found.
   */
  async _findByName(name) {
    return DocumentType.findOne({ where: { name } });
  }

  /**
   * Ensures a document type has no dependent records under a RESTRICT
   * constraint before allowing its deletion: 'usuario' and
   * 'receptor_certificado' both reference 'tipo_documento' with
   * onDelete: 'RESTRICT'. The 'estudiante' relationship is intentionally
   * excluded here since it uses onDelete: 'SET NULL' and therefore
   * never blocks the deletion at the database level.
   *
   * @private
   * @param {number} documentTypeId - The id of the document type to check.
   * @throws {Boom} - A conflict error when any restricting dependent exists.
   * @returns {Promise<void>}
   */
  async _assertNoRestrictingDependents(documentTypeId) {
    const documentTypeWithDependents = await DocumentType.findOne({
      where: { id: documentTypeId },
      include: [
        { association: 'users', required: false },
        { association: 'certificateRecipients', required: false },
      ]
    });

    const hasRestrictingDependents = Boolean(
      documentTypeWithDependents && (
        documentTypeWithDependents.users?.length ||
        documentTypeWithDependents.certificateRecipients?.length
      )
    );

    if (hasRestrictingDependents) {
      throw Boom.conflict(
        'No es posible eliminar el tipo de documento porque tiene usuarios o receptores de certificado asociados'
      );
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data.
  // ==========================================================

  /**
   * Normalizes a document type name by trimming surrounding whitespace,
   * without altering case or accents, since the value must match
   * exactly one of the options defined in the database ENUM.
   *
   * @static
   * @param {string} name - The raw name to normalize.
   * @returns {string} - The normalized name.
   */
  static normalizeName(name) {
    return name.trim();
  }
}

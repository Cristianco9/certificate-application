// Import the DocumentTypeServices class to manage the document type operations
import { DocumentTypeServices } from '../../services/documentTypeServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing document type.
 *
 * Extracts the document type id and its new name from the request
 * body, delegates the update to DocumentTypeServices, and responds
 * according to the outcome. The rotated JWT is not signed here:
 * authAppVerifyToken already generated it upstream, wrote it to the
 * httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The request object containing the document type id and the new data.
 * @param {Object} req.body - The validated request body (see documentTypeSchema.updateDocumentTypeData).
 * @param {string} req.body.id - The id of the document type to update.
 * @param {string} req.body.name - The new document type name.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneDocumentType = async (req, res, next) => {
  // Extract the document type id to update
  const { id } = req.body;

  // Extract the new document type data (name is the only mutable field)
  const newDocumentTypeData = {
    name: req.body.name,
  };

  // Instantiate the DocumentTypeServices class to manage the document type operations
  const documentTypeManager = new DocumentTypeServices();

  try {
    // Attempt to update the document type using the provided data
    const response = await documentTypeManager.updateOne(id, newDocumentTypeData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Tipo de documento actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // DocumentTypeServices already throws boomified errors (e.g. not
    // found, conflict on duplicate name, bad request on an invalid
    // ENUM value); boomify() passes those through untouched and only
    // defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el tipo de documento en la base de datos',
    });
    next(boomError);
  }
};

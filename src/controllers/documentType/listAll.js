// Import the DocumentTypeServices class to manage the document type operations
import { DocumentTypeServices } from '../../services/documentTypeServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete a document type.
 *
 * Extracts the document type id from the request body, delegates the
 * deletion to DocumentTypeServices, and responds according to the
 * outcome. The service layer guarantees a document type is never
 * deleted while it still has associated users, certificate recipients,
 * or students. The rotated JWT is not signed here: authAppVerifyToken
 * already generated it upstream, wrote it to the httpOnly
 * 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The request object containing the document type id.
 * @param {Object} req.body - The validated request body (see documentTypeSchema.deleteDocumentType).
 * @param {string} req.body.id - The id of the document type to delete.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneDocumentType = async (req, res, next) => {
  // Extract the document type id to delete
  const { id } = req.body;

  // Instantiate the DocumentTypeServices class to manage the document type operations
  const documentTypeManager = new DocumentTypeServices();

  try {
    // Attempt to delete the document type
    const response = await documentTypeManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Tipo de documento eliminado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // DocumentTypeServices already throws boomified errors (e.g. not
    // found, or a conflict because associated users, certificate
    // recipients, or students still exist); boomify() passes those
    // through untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el tipo de documento de la base de datos',
    });
    next(boomError);
  }
};

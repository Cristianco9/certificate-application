// Import the DocumentTypeServices class to manage the document type operations
import { DocumentTypeServices } from '../../services/documentTypeServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single document type by its exact
 * name. Since 'name' is backed by a fixed ENUM (a closed, small set of
 * values), this is an exact lookup rather than a partial-text search —
 * unlike Country/Department/Municipality, DocumentType has no
 * 'search by partial name' endpoint.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The request object containing the document type name.
 * @param {Object} req.body - The validated request body (see documentTypeSchema.getDocumentTypeByName).
 * @param {string} req.body.name - The exact document type name to search for.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching document type and the rotated token.
 */
export const listDocumentTypeByName = async (req, res, next) => {
  // Extract the document type name to search for
  const { name } = req.body;

  // Instantiate the DocumentTypeServices class to manage the document type operations
  const documentTypeManager = new DocumentTypeServices();

  try {
    // Attempt to find the document type by its exact name
    const theDocumentType = await documentTypeManager.listByName(name);

    return res.status(200).json({
      success: true,
      message: 'Tipo de documento encontrado exitosamente',
      documentType: theDocumentType,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // DocumentTypeServices already throws boomified errors (e.g. not
    // found, bad request); boomify() passes those through untouched
    // and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el tipo de documento por su nombre',
    });
    next(boomError);
  }
};

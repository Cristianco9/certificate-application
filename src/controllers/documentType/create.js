// Import the DocumentTypeServices class to manage the document type operations
import { DocumentTypeServices } from '../../services/documentTypeServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new document type.
 *
 * Extracts the new document type data from the request body, delegates
 * the creation to DocumentTypeServices, and responds according to the
 * outcome. The rotated JWT is not . signed here: authAppVerifyToken
 * already generated it upstream, wrote it to the httpOnly
 * 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The request object containing the document type's data.
 * @param {Object} req.body - The validated request body (see documentTypeSchema.newDocumentTypeData).
 * @param {string} req.body.name - The name of the document type to create.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneDocumentType = async (req, res, next) => {
  // Extract the new document type data from the request body
  const newDocumentType = {
    name: req.body.name,
  };

  // Instantiate the DocumentTypeServices class to manage the document type operations
  const documentTypeManager = new DocumentTypeServices();

  try {
    // Attempt to create a new document type using the provided data
    const response = await documentTypeManager.createOne(newDocumentType);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Tipo de documento creado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // DocumentTypeServices already throws boomified errors (e.g.
    // conflict on duplicate name, bad request on an invalid ENUM
    // value); boomify() passes those through untouched and only
    // defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el tipo de documento en la base de datos',
    });
    next(boomError);
  }
};

// Import the MunicipalityServices class to manage the municipality operations
import { MunicipalityServices } from '../../services/municipalityServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete a municipality.
 *
 * Extracts the municipality id from the request body, delegates the
 * deletion to MunicipalityServices, and responds according to the
 * outcome. The service layer guarantees a municipality is never
 * deleted while it still has associated students, users, certificate
 * signatures, or institutions. The rotated JWT is not signed here:
 * authAppVerifyToken already generated it upstream, wrote it to the
 * httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The request object containing the municipality id.
 * @param {Object} req.body - The validated request body (see municipalitySchema.deleteMunicipality).
 * @param {string} req.body.id - The id of the municipality to delete.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneMunicipality = async (req, res, next) => {
  // Extract the municipality id to delete
  const { id } = req.body;

  // Instantiate the MunicipalityServices class to manage the municipality operations
  const municipalityManager = new MunicipalityServices();

  try {
    // Attempt to delete the municipality
    const response = await municipalityManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Municipio eliminado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // MunicipalityServices already throws boomified errors (e.g. not
    // found, or a conflict because associated students, users,
    // certificate signatures, or institutions still exist); boomify()
    // passes those through untouched and only defaults unexpected
    // errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el municipio de la base de datos',
    });
    next(boomError);
  }
};

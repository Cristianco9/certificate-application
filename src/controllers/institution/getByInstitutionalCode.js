// Import the InstitutionServices class to manage institution-related database operations
import { InstitutionServices } from '../../services/institutionServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single institution by its exact institutional code.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionSchema.getInstitutionByInstitutionalCode).
 * @param {string} req.body.institutionalCode - The institutional code to search for.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the matching institution and the rotated token.
 */
export const getInstitutionByInstitutionalCode = async (req, res, next) => {
  // Extract the institutional code from the request body
  const { institutionalCode } = req.body;

  // Instantiate the service that manages institution operations
  const institutionManager = new InstitutionServices();

  try {
    // Attempt to retrieve the institution by its institutional code
    const theInstitution = await institutionManager.listByInstitutionalCode(institutionalCode);

    return res.status(200).json({
      success: true,
      message: 'Institución encontrada exitosamente',
      institution: theInstitution,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // InstitutionServices already throws boomified errors (e.g. notFound);
    // boomify() passes those through untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar la institución por su código institucional',
    });
    next(boomError);
  }
};

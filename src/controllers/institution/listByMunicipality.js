// Import the InstitutionServices class to manage institution-related database operations
import { InstitutionServices } from '../../services/institutionServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve all institutions belonging to a given municipality.
 * Supports cascading selects in the UI (country -> department -> municipality -> institution).
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionSchema.getInstitutionsByMunicipality).
 * @param {string} req.body.municipalityId - The id of the municipality.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the matching institutions and the rotated token.
 */
export const listInstitutionsByMunicipality = async (req, res, next) => {
  // Extract the municipality id from the request body
  const { municipalityId } = req.body;

  // Instantiate the service that manages institution operations
  const institutionManager = new InstitutionServices();

  try {
    // Attempt to find institutions belonging to the given municipality
    const institutionsByMunicipality = await institutionManager.listByMunicipality(municipalityId);

    return res.status(200).json({
      success: true,
      message: 'Instituciones encontradas exitosamente',
      institutions: institutionsByMunicipality,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // InstitutionServices already throws boomified errors; boomify() passes
    // those through untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar las instituciones para el municipio indicado',
    });
    next(boomError);
  }
};

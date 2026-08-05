// Import the MunicipalityServices class to manage the municipality operations
import { MunicipalityServices } from '../../services/municipalityServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single municipality by its id.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The request object containing the municipality id.
 * @param {Object} req.body - The validated request body (see municipalitySchema.getMunicipalityById).
 * @param {string} req.body.id - The id of the municipality to retrieve.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested municipality and the rotated token.
 */
export const listOneMunicipality = async (req, res, next) => {
  // Extract the municipality id to look up
  const { id } = req.body;

  // Instantiate the MunicipalityServices class to manage the municipality operations
  const municipalityManager = new MunicipalityServices();

  try {
    // Attempt to find the municipality
    const theMunicipality = await municipalityManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Municipio encontrado exitosamente',
      municipality: theMunicipality,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // MunicipalityServices already throws boomified errors (e.g. not
    // found, bad request); boomify() passes those through untouched
    // and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el municipio en la base de datos',
    });
    next(boomError);
  }
};

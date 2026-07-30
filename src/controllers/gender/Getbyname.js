// Import the GenderServices class to manage gender-related database operations
import { GenderServices } from '../../services/genderService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single gender by its exact name.
 * Since 'name' is backed by a fixed ENUM (a closed, small set of
 * values), an exact lookup is more meaningful here than a partial-text
 * search.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see genderSchema.getGenderByName).
 * @param {string} req.body.name - The gender name to search for.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the matching gender and the rotated token.
 */
export const getGenderByName = async (req, res, next) => {
  // Extract the gender name from the request body
  const { name } = req.body;

  // Instantiate the service that manages gender operations
  const genderManager = new GenderServices();

  try {
    // Attempt to retrieve the gender by its name
    const theGender = await genderManager.listByName(name);

    return res.status(200).json({
      success: true,
      message: 'Género encontrado exitosamente',
      gender: theGender,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // GenderServices already throws boomified errors (e.g. notFound);
    // boomify() passes those through untouched and only defaults
    // unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el género por su nombre',
    });
    next(boomError);
  }
};

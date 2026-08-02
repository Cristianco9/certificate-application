// Import the AcademicLevelServices class to manage academic-level-related database operations
import { AcademicLevelServices } from '../../services/academicLevelServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single academic level by its exact
 * abbreviation. Since 'abbreviation' is backed by a fixed ENUM, an exact
 * lookup is more meaningful here than a partial-text search.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see academicLevelSchema.getAcademicLevelByAbbreviation).
 * @param {string} req.body.abbreviation - The academic level abbreviation to search for.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the matching academic level and the rotated token.
 */
export const getAcademicLevelByAbbreviation = async (req, res, next) => {
  // Extract the academic level abbreviation from the request body
  const { abbreviation } = req.body;

  // Instantiate the service that manages academic level operations
  const academicLevelManager = new AcademicLevelServices();

  try {
    // Attempt to retrieve the academic level by its abbreviation
    const theAcademicLevel = await academicLevelManager.listByAbbreviation(abbreviation);

    return res.status(200).json({
      success: true,
      message: 'Nivel académico encontrado exitosamente',
      academicLevel: theAcademicLevel,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // AcademicLevelServices already throws boomified errors (e.g.
    // notFound); boomify() passes those through untouched and only
    // defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el nivel académico por su abreviatura',
    });
    next(boomError);
  }
};

// Import the AcademicLevelServices class to manage academic-level-related database operations
import { AcademicLevelServices } from '../../services/academicLevelServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new academic level.
 *
 * Extracts the new academic level data from the request body, delegates
 * the creation to AcademicLevelServices, and responds according to the
 * outcome. The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see academicLevelSchema.newAcademicLevelData).
 * @param {string} req.body.name - The name of the academic level to create.
 * @param {string} req.body.abbreviation - The abbreviation of the academic level to create.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneAcademicLevel = async (req, res, next) => {
  // Extract the new academic level data from the request body
  const newAcademicLevel = {
    name: req.body.name,
    abbreviation: req.body.abbreviation,
  };

  // Instantiate the service that manages academic level operations
  const academicLevelManager = new AcademicLevelServices();

  try {
    // Attempt to create the academic level using the provided data
    const response = await academicLevelManager.createOne(newAcademicLevel);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Nivel académico creado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // AcademicLevelServices already throws boomified errors (e.g.
    // conflict on duplicate name/abbreviation, bad request on invalid
    // ENUM value); boomify() passes those through untouched and only
    // defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el nivel académico en la base de datos',
    });
    next(boomError);
  }
};

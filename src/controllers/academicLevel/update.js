// Import the AcademicLevelServices class to manage academic-level-related database operations
import { AcademicLevelServices } from '../../services/academicLevelService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing academic level.
 *
 * Extracts the academic level id and the fields to update from the
 * request body, delegates the update to AcademicLevelServices, and
 * responds according to the outcome. The rotated JWT is not signed here:
 * authAppVerifyToken already generated it upstream, wrote it to the
 * httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see academicLevelSchema.updateAcademicLevelData).
 * @param {string} req.body.id - The id of the academic level to update.
 * @param {string} [req.body.name] - The new name of the academic level.
 * @param {string} [req.body.abbreviation] - The new abbreviation of the academic level.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneAcademicLevel = async (req, res, next) => {
  // Extract the academic level id and the new data from the request body
  const { id } = req.body;
  const newAcademicLevelData = {
    name: req.body.name,
    abbreviation: req.body.abbreviation,
  };

  // Instantiate the service that manages academic level operations
  const academicLevelManager = new AcademicLevelServices();

  try {
    // Attempt to update the academic level using the provided data
    const response = await academicLevelManager.updateOne(id, newAcademicLevelData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Nivel académico actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // AcademicLevelServices already throws boomified errors (e.g.
    // notFound, conflict on duplicate name/abbreviation, bad request on
    // invalid ENUM value); boomify() passes those through untouched and
    // only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el nivel académico en la base de datos',
    });
    next(boomError);
  }
};

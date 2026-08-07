import { GradeServices } from '../../services/gradeServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single grade by its exact name.
 * Since 'name' is backed by a fixed ENUM, an exact lookup is more meaningful
 * than a partial-text search.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see gradeSchema.getGradeByName).
 * @param {string} req.body.name - The exact grade name to search for.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching grade and the rotated token.
 */
export const getGradeByName = async (req, res, next) => {
  const { name } = req.body;
  const gradeManager = new GradeServices();

  try {
    const theGrade = await gradeManager.listByName(name);

    return res.status(200).json({
      success: true,
      message: 'Grado encontrado exitosamente',
      grade: theGrade,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el grado por su nombre',
    });
    next(boomError);
  }
};

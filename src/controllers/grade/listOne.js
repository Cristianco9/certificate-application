import { GradeServices } from '../../services/gradeServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single grade by its id.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see gradeSchema.getGradeById).
 * @param {string} req.body.id - The id of the grade to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested grade and the rotated token.
 */
export const listOneGrade = async (req, res, next) => {
  const { id } = req.body;
  const gradeManager = new GradeServices();

  try {
    const theGrade = await gradeManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Grado encontrado exitosamente',
      grade: theGrade,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el grado en la base de datos',
    });
    next(boomError);
  }
};

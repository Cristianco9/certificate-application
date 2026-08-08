import { GradeServices } from '../../services/gradeServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to create a new grade.
 *
 * Extracts the new grade data from the request body, delegates the creation
 * to GradeServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see gradeSchema.newGradeData).
 * @param {string} req.body.name - The grade name (e.g. 'Primero').
 * @param {string} req.body.description - The grade description.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneGrade = async (req, res, next) => {
  const newGrade = {
    name: req.body.name,
    description: req.body.description,
  };

  const gradeManager = new GradeServices();

  try {
    const response = await gradeManager.createOne(newGrade);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Grado creado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el grado en la base de datos',
    });
    next(boomError);
  }
};

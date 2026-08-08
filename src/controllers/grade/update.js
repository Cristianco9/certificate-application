import { GradeServices } from '../../services/gradeServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing grade.
 *
 * Extracts the grade id and the fields to update from the request body,
 * delegates the update to GradeServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see gradeSchema.updateGradeData).
 * @param {string} req.body.id - The id of the grade to update.
 * @param {string} [req.body.name] - The new grade name.
 * @param {string} [req.body.description] - The new grade description.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneGrade = async (req, res, next) => {
  const { id } = req.body;
  const newGradeData = {
    name: req.body.name,
    description: req.body.description,
  };

  const gradeManager = new GradeServices();

  try {
    const response = await gradeManager.updateOne(id, newGradeData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Grado actualizado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el grado en la base de datos',
    });
    next(boomError);
  }
};

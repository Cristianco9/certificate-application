import { StudentPhoneServices } from '../../services/studentPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single StudentPhone record by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see studentPhoneSchema.getStudentPhoneById).
 * @param {string} req.body.id - The id of the student-phone link to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested link and the rotated token.
 */
export const listOneStudentPhone = async (req, res, next) => {
  const { id } = req.body;
  const studentPhoneManager = new StudentPhoneServices();

  try {
    const theLink = await studentPhoneManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Vínculo estudiante-teléfono encontrado exitosamente',
      studentPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el vínculo estudiante-teléfono en la base de datos',
    });
    next(boomError);
  }
};

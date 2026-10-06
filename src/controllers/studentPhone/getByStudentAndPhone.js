import { StudentPhoneServices } from '../../services/studentPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the single StudentPhone record (if any)
 * linking a specific student to a specific phone.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see studentPhoneSchema.getStudentPhoneByStudentAndPhone).
 * @param {string} req.body.studentId - The id of the student.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching link and the rotated token.
 */
export const getStudentPhoneByStudentAndPhone = async (req, res, next) => {
  const { studentId, phoneId } = req.body;
  const studentPhoneManager = new StudentPhoneServices();

  try {
    const theLink = await studentPhoneManager.getByStudentAndPhone(studentId, phoneId);

    return res.status(200).json({
      success: true,
      message: 'Vínculo estudiante-teléfono encontrado exitosamente',
      studentPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el vínculo entre el estudiante y el teléfono indicados',
    });
    next(boomError);
  }
};

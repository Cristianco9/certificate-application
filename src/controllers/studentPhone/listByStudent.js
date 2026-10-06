import { StudentPhoneServices } from '../../services/studentPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every phone linked to a given student.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see studentPhoneSchema.listStudentPhonesByStudent).
 * @param {string} req.body.studentId - The id of the student.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listStudentPhonesByStudent = async (req, res, next) => {
  const { studentId } = req.body;
  const studentPhoneManager = new StudentPhoneServices();

  try {
    const { total, records } = await studentPhoneManager.listByStudent(studentId);

    return res.status(200).json({
      success: true,
      message: 'Teléfonos del estudiante encontrados exitosamente',
      total,
      studentPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los teléfonos del estudiante indicado',
    });
    next(boomError);
  }
};

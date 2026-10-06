import { StudentPhoneServices } from '../../services/studentPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to unlink a phone from a student by composite key
 * (studentId + phoneId), without requiring a prior lookup of the link id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see studentPhoneSchema.unlinkStudentPhone).
 * @param {string} req.body.studentId - The id of the student.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const unlinkStudentPhone = async (req, res, next) => {
  const { studentId, phoneId } = req.body;
  const studentPhoneManager = new StudentPhoneServices();

  try {
    const response = await studentPhoneManager.unlinkByStudentAndPhone(studentId, phoneId);

    if (response.status === 'UNLINKED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Teléfono desvinculado del estudiante exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible desvincular el teléfono del estudiante en la base de datos',
    });
    next(boomError);
  }
};

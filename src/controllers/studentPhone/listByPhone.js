import { StudentPhoneServices } from '../../services/studentPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every student linked to a given phone.
 * Returns at most one record in practice (single-owner rule).
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see studentPhoneSchema.listStudentPhonesByPhone).
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listStudentPhonesByPhone = async (req, res, next) => {
  const { phoneId } = req.body;
  const studentPhoneManager = new StudentPhoneServices();

  try {
    const { total, records } = await studentPhoneManager.listByPhone(phoneId);

    return res.status(200).json({
      success: true,
      message: 'Estudiantes vinculados al teléfono encontrados exitosamente',
      total,
      studentPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los estudiantes vinculados al teléfono indicado',
    });
    next(boomError);
  }
};

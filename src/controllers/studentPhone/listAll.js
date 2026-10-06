import { StudentPhoneServices } from '../../services/studentPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to list every StudentPhone record.
 *
 * @param {Object} req - The Express request object (no body parameters required).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the full list and the rotated token.
 */
export const listAllStudentPhones = async (req, res, next) => {
  const studentPhoneManager = new StudentPhoneServices();

  try {
    const { total, records } = await studentPhoneManager.listAll();

    return res.status(200).json({
      success: true,
      message: 'Vínculos estudiante-teléfono encontrados exitosamente',
      total,
      studentPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los vínculos estudiante-teléfono en la base de datos',
    });
    next(boomError);
  }
};

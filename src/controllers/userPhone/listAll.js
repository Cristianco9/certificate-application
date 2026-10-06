import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to list every UserPhone record.
 *
 * @param {Object} req - The Express request object (no body parameters required).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the full list and the rotated token.
 */
export const listAllUserPhones = async (req, res, next) => {
  const userPhoneManager = new UserPhoneServices();

  try {
    const { total, records } = await userPhoneManager.listAll();

    return res.status(200).json({
      success: true,
      message: 'Vínculos usuario-teléfono encontrados exitosamente',
      total,
      userPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los vínculos usuario-teléfono en la base de datos',
    });
    next(boomError);
  }
};

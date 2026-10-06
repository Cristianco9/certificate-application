import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every user linked to a given phone.
 * Returns at most one record in practice (single-owner rule).
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userPhoneSchema.listUserPhonesByPhone).
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listUserPhonesByPhone = async (req, res, next) => {
  const { phoneId } = req.body;
  const userPhoneManager = new UserPhoneServices();

  try {
    const { total, records } = await userPhoneManager.listByPhone(phoneId);

    return res.status(200).json({
      success: true,
      message: 'Usuarios vinculados al teléfono encontrados exitosamente',
      total,
      userPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los usuarios vinculados al teléfono indicado',
    });
    next(boomError);
  }
};

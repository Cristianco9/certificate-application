import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every phone linked to a given user.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userPhoneSchema.listUserPhonesByUser).
 * @param {string} req.body.userId - The id of the user.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listUserPhonesByUser = async (req, res, next) => {
  const { userId } = req.body;
  const userPhoneManager = new UserPhoneServices();

  try {
    const { total, records } = await userPhoneManager.listByUser(userId);

    return res.status(200).json({
      success: true,
      message: 'Teléfonos del usuario encontrados exitosamente',
      total,
      userPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los teléfonos del usuario indicado',
    });
    next(boomError);
  }
};

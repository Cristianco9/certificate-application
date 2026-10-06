import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the single UserPhone record (if any)
 * linking a specific user to a specific phone.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userPhoneSchema.getUserPhoneByUserAndPhone).
 * @param {string} req.body.userId - The id of the user.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching link and the rotated token.
 */
export const getUserPhoneByUserAndPhone = async (req, res, next) => {
  const { userId, phoneId } = req.body;
  const userPhoneManager = new UserPhoneServices();

  try {
    const theLink = await userPhoneManager.getByUserAndPhone(userId, phoneId);

    return res.status(200).json({
      success: true,
      message: 'Vínculo usuario-teléfono encontrado exitosamente',
      userPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el vínculo entre el usuario y el teléfono indicados',
    });
    next(boomError);
  }
};

import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to unlink a phone from a user by composite key
 * (userId + phoneId), without requiring a prior lookup of the link id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userPhoneSchema.unlinkUserPhone).
 * @param {string} req.body.userId - The id of the user.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const unlinkUserPhone = async (req, res, next) => {
  const { userId, phoneId } = req.body;
  const userPhoneManager = new UserPhoneServices();

  try {
    const response = await userPhoneManager.unlinkByUserAndPhone(userId, phoneId);

    if (response.status === 'UNLINKED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Teléfono desvinculado del usuario exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible desvincular el teléfono del usuario en la base de datos',
    });
    next(boomError);
  }
};

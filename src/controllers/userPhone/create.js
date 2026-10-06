import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to link a phone to a user.
 *
 * Extracts the new UserPhone data from the request body, delegates the
 * creation to UserPhoneServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated
 * it upstream, wrote it to the httpOnly 'authentication' cookie, and
 * exposed the same value via res.locals.newUserToken for clients that also
 * need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userPhoneSchema.newUserPhoneData).
 * @param {string} req.body.userId - The id of the user to link.
 * @param {string} req.body.phoneId - The id of the phone to link.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneUserPhone = async (req, res, next) => {
  const newUserPhone = {
    userId: req.body.userId,
    phoneId: req.body.phoneId,
  };

  const userPhoneManager = new UserPhoneServices();

  try {
    const response = await userPhoneManager.createOne(newUserPhone);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Teléfono vinculado al usuario exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible vincular el teléfono al usuario en la base de datos',
    });
    next(boomError);
  }
};

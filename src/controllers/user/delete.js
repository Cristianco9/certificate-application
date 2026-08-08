import { UserServices } from '../../services/userServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to delete an existing user.
 *
 * Extracts the user id from the request body, delegates the deletion to
 * UserServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userSchema.deleteUser).
 * @param {string} req.body.id - The id of the user to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneUser = async (req, res, next) => {
  const { id } = req.body;
  const userManager = new UserServices();

  try {
    const response = await userManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el usuario de la base de datos',
    });
    next(boomError);
  }
};

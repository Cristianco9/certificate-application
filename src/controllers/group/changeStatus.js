import { GroupServices } from '../../services/groupServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to change the status of an existing group (ACTIVO/INACTIVO).
 * Exposed as a dedicated business method, rather than relying on the generic updateOne.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see groupSchema.changeGroupStatus).
 * @param {string} req.body.id - The id of the group to update.
 * @param {string} req.body.status - The new status ('ACTIVO' or 'INACTIVO').
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const changeGroupStatus = async (req, res, next) => {
  const { id, status } = req.body;
  const groupManager = new GroupServices();

  try {
    const response = await groupManager.changeStatus(id, status);

    if (response.status === 'STATUS UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Estado del grupo actualizado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el estado del grupo',
    });
    next(boomError);
  }
};

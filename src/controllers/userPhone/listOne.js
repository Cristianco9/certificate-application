import { UserPhoneServices } from '../../services/userPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single UserPhone record by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userPhoneSchema.getUserPhoneById).
 * @param {string} req.body.id - The id of the user-phone link to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested link and the rotated token.
 */
export const listOneUserPhone = async (req, res, next) => {
  const { id } = req.body;
  const userPhoneManager = new UserPhoneServices();

  try {
    const theLink = await userPhoneManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Vínculo usuario-teléfono encontrado exitosamente',
      userPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el vínculo usuario-teléfono en la base de datos',
    });
    next(boomError);
  }
};

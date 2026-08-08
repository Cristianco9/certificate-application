import { PhoneServices } from '../../services/phoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a phone by its exact number.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see phoneSchema.getPhoneByNumber).
 * @param {string} req.body.number - The exact phone number to search for.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching phone and the rotated token.
 */
export const getPhoneByNumber = async (req, res, next) => {
  const { number } = req.body;
  const phoneManager = new PhoneServices();

  try {
    const thePhone = await phoneManager.listByNumber(number);

    return res.status(200).json({
      success: true,
      message: 'Teléfono encontrado exitosamente',
      phone: thePhone,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el teléfono por su número',
    });
    next(boomError);
  }
};

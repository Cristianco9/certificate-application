import { PhoneServices } from '../../services/phoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to create a new phone record.
 * The phone starts unowned; use linkPhoneToOwner to associate it with an owner.
 *
 * Extracts the new phone number from the request body, delegates the creation
 * to PhoneServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see phoneSchema.newPhoneData).
 * @param {string} req.body.number - The phone number.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOnePhone = async (req, res, next) => {
  const newPhone = {
    number: req.body.number,
  };

  const phoneManager = new PhoneServices();

  try {
    const response = await phoneManager.createOne(newPhone);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Teléfono creado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el teléfono en la base de datos',
    });
    next(boomError);
  }
};

import { PhoneServices } from '../../services/phoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing phone number.
 *
 * Extracts the phone id and the new number from the request body,
 * delegates the update to PhoneServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see phoneSchema.updatePhoneData).
 * @param {string} req.body.id - The id of the phone to update.
 * @param {string} req.body.number - The new phone number.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOnePhone = async (req, res, next) => {
  const { id } = req.body;
  const newPhoneData = {
    number: req.body.number,
  };

  const phoneManager = new PhoneServices();

  try {
    const response = await phoneManager.updateOne(id, newPhoneData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Teléfono actualizado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el teléfono en la base de datos',
    });
    next(boomError);
  }
};

import { InstitutionPhoneServices } from '../../services/institutionPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single InstitutionPhone record by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionPhoneSchema.getInstitutionPhoneById).
 * @param {string} req.body.id - The id of the institution-phone link to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested link and the rotated token.
 */
export const listOneInstitutionPhone = async (req, res, next) => {
  const { id } = req.body;
  const institutionPhoneManager = new InstitutionPhoneServices();

  try {
    const theLink = await institutionPhoneManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Vínculo institución-teléfono encontrado exitosamente',
      institutionPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el vínculo institución-teléfono en la base de datos',
    });
    next(boomError);
  }
};

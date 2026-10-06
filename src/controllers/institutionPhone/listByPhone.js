import { InstitutionPhoneServices } from '../../services/institutionPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every institution linked to a given
 * phone. Returns at most one record in practice (single-owner rule).
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionPhoneSchema.listInstitutionPhonesByPhone).
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listInstitutionPhonesByPhone = async (req, res, next) => {
  const { phoneId } = req.body;
  const institutionPhoneManager = new InstitutionPhoneServices();

  try {
    const { total, records } = await institutionPhoneManager.listByPhone(phoneId);

    return res.status(200).json({
      success: true,
      message: 'Instituciones vinculadas al teléfono encontradas exitosamente',
      total,
      institutionPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar las instituciones vinculadas al teléfono indicado',
    });
    next(boomError);
  }
};

import { InstitutionPhoneServices } from '../../services/institutionPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the single InstitutionPhone record
 * (if any) linking a specific institution to a specific phone.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionPhoneSchema.getInstitutionPhoneByInstitutionAndPhone).
 * @param {string} req.body.institutionId - The id of the institution.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching link and the rotated token.
 */
export const getInstitutionPhoneByInstitutionAndPhone = async (req, res, next) => {
  const { institutionId, phoneId } = req.body;
  const institutionPhoneManager = new InstitutionPhoneServices();

  try {
    const theLink = await institutionPhoneManager.getByInstitutionAndPhone(institutionId, phoneId);

    return res.status(200).json({
      success: true,
      message: 'Vínculo institución-teléfono encontrado exitosamente',
      institutionPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el vínculo entre la institución y el teléfono indicados',
    });
    next(boomError);
  }
};

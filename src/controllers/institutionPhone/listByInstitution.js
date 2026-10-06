import { InstitutionPhoneServices } from '../../services/institutionPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every phone linked to a given institution.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionPhoneSchema.listInstitutionPhonesByInstitution).
 * @param {string} req.body.institutionId - The id of the institution.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listInstitutionPhonesByInstitution = async (req, res, next) => {
  const { institutionId } = req.body;
  const institutionPhoneManager = new InstitutionPhoneServices();

  try {
    const { total, records } = await institutionPhoneManager.listByInstitution(institutionId);

    return res.status(200).json({
      success: true,
      message: 'Teléfonos de la institución encontrados exitosamente',
      total,
      institutionPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los teléfonos de la institución indicada',
    });
    next(boomError);
  }
};

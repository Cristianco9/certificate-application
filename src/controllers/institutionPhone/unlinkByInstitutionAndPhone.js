import { InstitutionPhoneServices } from '../../services/institutionPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to unlink a phone from an institution by composite
 * key (institutionId + phoneId), without requiring a prior lookup of the
 * link id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionPhoneSchema.unlinkInstitutionPhone).
 * @param {string} req.body.institutionId - The id of the institution.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const unlinkInstitutionPhone = async (req, res, next) => {
  const { institutionId, phoneId } = req.body;
  const institutionPhoneManager = new InstitutionPhoneServices();

  try {
    const response = await institutionPhoneManager.unlinkByInstitutionAndPhone(institutionId, phoneId);

    if (response.status === 'UNLINKED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Teléfono desvinculado de la institución exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible desvincular el teléfono de la institución en la base de datos',
    });
    next(boomError);
  }
};

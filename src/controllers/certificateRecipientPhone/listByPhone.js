import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every certificate recipient linked to
 * a given phone. Returns at most one record in practice (single-owner
 * rule).
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.listCertificateRecipientPhonesByPhone).
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listCertificateRecipientPhonesByPhone = async (req, res, next) => {
  const { phoneId } = req.body;
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const { total, records } = await certificateRecipientPhoneManager.listByPhone(phoneId);

    return res.status(200).json({
      success: true,
      message: 'Receptores del certificado vinculados al teléfono encontrados exitosamente',
      total,
      certificateRecipientPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los receptores del certificado vinculados al teléfono indicado',
    });
    next(boomError);
  }
};

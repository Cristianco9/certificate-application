import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the single CertificateRecipientPhone
 * record (if any) linking a specific certificate recipient to a specific
 * phone.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.getCertificateRecipientPhoneByCertificateRecipientAndPhone).
 * @param {string} req.body.certificateRecipientId - The id of the certificate recipient.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching link and the rotated token.
 */
export const getCertificateRecipientPhoneByCertificateRecipientAndPhone = async (req, res, next) => {
  const { certificateRecipientId, phoneId } = req.body;
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const theLink = await certificateRecipientPhoneManager.getByCertificateRecipientAndPhone(
      certificateRecipientId,
      phoneId
    );

    return res.status(200).json({
      success: true,
      message: 'Vínculo receptor del certificado-teléfono encontrado exitosamente',
      certificateRecipientPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el vínculo entre el receptor del certificado y el teléfono indicados',
    });
    next(boomError);
  }
};

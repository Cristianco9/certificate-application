import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to unlink a phone from a certificate recipient by
 * composite key (certificateRecipientId + phoneId), without requiring a
 * prior lookup of the link id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.unlinkCertificateRecipientPhone).
 * @param {string} req.body.certificateRecipientId - The id of the certificate recipient.
 * @param {string} req.body.phoneId - The id of the phone.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const unlinkCertificateRecipientPhone = async (req, res, next) => {
  const { certificateRecipientId, phoneId } = req.body;
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const response = await certificateRecipientPhoneManager.unlinkByCertificateRecipientAndPhone(
      certificateRecipientId,
      phoneId
    );

    if (response.status === 'UNLINKED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Teléfono desvinculado del receptor del certificado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible desvincular el teléfono del receptor del certificado en la base de datos',
    });
    next(boomError);
  }
};

import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every phone linked to a given
 * certificate recipient.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.listCertificateRecipientPhonesByCertificateRecipient).
 * @param {string} req.body.certificateRecipientId - The id of the certificate recipient.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching links and the rotated token.
 */
export const listCertificateRecipientPhonesByCertificateRecipient = async (req, res, next) => {
  const { certificateRecipientId } = req.body;
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const { total, records } = await certificateRecipientPhoneManager.listByCertificateRecipient(certificateRecipientId);

    return res.status(200).json({
      success: true,
      message: 'Teléfonos del receptor del certificado encontrados exitosamente',
      total,
      certificateRecipientPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los teléfonos del receptor del certificado indicado',
    });
    next(boomError);
  }
};

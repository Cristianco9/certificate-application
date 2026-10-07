import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to link a phone to a certificate recipient.
 *
 * Extracts the new CertificateRecipientPhone data from the request body,
 * delegates the creation to CertificateRecipientPhoneServices, and
 * responds according to the outcome. The rotated JWT is not signed here:
 * authAppVerifyToken already generated it upstream, wrote it to the
 * httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in
 * the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.newCertificateRecipientPhoneData).
 * @param {string} req.body.certificateRecipientId - The id of the certificate recipient to link.
 * @param {string} req.body.phoneId - The id of the phone to link.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneCertificateRecipientPhone = async (req, res, next) => {
  const newCertificateRecipientPhone = {
    certificateRecipientId: req.body.certificateRecipientId,
    phoneId: req.body.phoneId,
  };

  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const response = await certificateRecipientPhoneManager.createOne(newCertificateRecipientPhone);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Teléfono vinculado al receptor del certificado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible vincular el teléfono al receptor del certificado en la base de datos',
    });
    next(boomError);
  }
};

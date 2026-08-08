import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to void an existing certificate.
 * This is a terminal business action that marks the certificate as no longer valid.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.voidCertificate).
 * @param {string} req.body.id - The id of the certificate to void.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const voidCertificate = async (req, res, next) => {
  const { id } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const response = await certificateManager.voidOne(id);

    if (response.status === 'VOIDED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Certificado anulado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible anular el certificado',
    });
    next(boomError);
  }
};

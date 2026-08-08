import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to reprint an existing certificate.
 * This method locates the existing record, verifies it can still be printed,
 * and moves its status to REIMPRESO, reflecting the reprint event in the audit trail.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.reprintCertificate).
 * @param {string} req.body.id - The id of the certificate to reprint.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the certificate data and the rotated token.
 */
export const reprintCertificate = async (req, res, next) => {
  const { id } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const theCertificate = await certificateManager.reprint(id);

    return res.status(200).json({
      success: true,
      message: 'Certificado reimpreso exitosamente',
      certificate: theCertificate,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible reimprimir el certificado',
    });
    next(boomError);
  }
};

import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to create a new certificate signature.
 *
 * Extracts the new signature data from the request body, delegates the
 * creation to CertificateSignatureServices, and responds according to
 * the outcome. The rotated JWT is not signed here: authAppVerifyToken
 * already generated it upstream, wrote it to the httpOnly
 * 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in
 * the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.newCertificateSignatureData).
 * @param {string} req.body.userId - The id of the signer.
 * @param {string} req.body.certificateId - The id of the certificate.
 * @param {string} req.body.municipalityId - The id of the municipality where the signature is executed.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneCertificateSignature = async (req, res, next) => {
  const newCertificateSignature = {
    userId: req.body.userId,
    certificateId: req.body.certificateId,
    municipalityId: req.body.municipalityId,
  };

  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const response = await certificateSignatureManager.createOne(newCertificateSignature);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Firma del certificado creada exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear la firma del certificado en la base de datos',
    });
    next(boomError);
  }
};

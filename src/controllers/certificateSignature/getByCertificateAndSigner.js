import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the single signature record (if any)
 * linking a specific signer to a specific certificate.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.getCertificateSignatureByCertificateAndSigner).
 * @param {string} req.body.certificateId - The id of the certificate.
 * @param {string} req.body.userId - The id of the signer.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching signature and the rotated token.
 */
export const getCertificateSignatureByCertificateAndSigner = async (req, res, next) => {
  const { certificateId, userId } = req.body;
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const theSignature = await certificateSignatureManager.getByCertificateAndSigner(certificateId, userId);

    return res.status(200).json({
      success: true,
      message: 'Firma del certificado encontrada exitosamente',
      certificateSignature: theSignature,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar la firma para el certificado y firmante indicados',
    });
    next(boomError);
  }
};

import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing certificate signature.
 *
 * Extracts the signature id and the fields to update from the request
 * body, delegates the update to CertificateSignatureServices, and
 * responds according to the outcome. 'userId' is intentionally NOT part
 * of the update payload: reassigning a signature to a different signer
 * is semantically a delete + create. The rotated JWT is not signed
 * here: authAppVerifyToken already generated it upstream, wrote it to
 * the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in
 * the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.updateCertificateSignatureData).
 * @param {string} req.body.id - The id of the certificate signature to update.
 * @param {string} [req.body.certificateId] - The new certificate id.
 * @param {string} [req.body.municipalityId] - The new municipality id.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneCertificateSignature = async (req, res, next) => {
  const { id } = req.body;
  const newCertificateSignatureData = {
    certificateId: req.body.certificateId,
    municipalityId: req.body.municipalityId,
  };

  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const response = await certificateSignatureManager.updateOne(id, newCertificateSignatureData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Firma del certificado actualizada exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar la firma del certificado en la base de datos',
    });
    next(boomError);
  }
};

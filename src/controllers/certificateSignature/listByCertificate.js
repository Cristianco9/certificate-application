import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to list every signature attached to a given
 * certificate.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.listCertificateSignaturesByCertificate).
 * @param {string} req.body.certificateId - The id of the certificate.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching signatures and the rotated token.
 */
export const listCertificateSignaturesByCertificate = async (req, res, next) => {
  const { certificateId } = req.body;
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const { total, records } = await certificateSignatureManager.listByCertificate(certificateId);

    return res.status(200).json({
      success: true,
      message: 'Firmas del certificado encontradas exitosamente',
      total,
      certificateSignatures: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar las firmas del certificado indicado',
    });
    next(boomError);
  }
};

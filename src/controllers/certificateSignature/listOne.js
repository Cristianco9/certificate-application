import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single certificate signature by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.getCertificateSignatureById).
 * @param {string} req.body.id - The id of the certificate signature to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested signature and the rotated token.
 */
export const listOneCertificateSignature = async (req, res, next) => {
  const { id } = req.body;
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const theSignature = await certificateSignatureManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Firma del certificado encontrada exitosamente',
      certificateSignature: theSignature,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar la firma del certificado en la base de datos',
    });
    next(boomError);
  }
};

import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the single signature record
 * registered for a given signer. Returns one record (not a collection)
 * because 'id_usuario_firmacertificado' is UNIQUE — a user can only ever
 * be registered as a signer once.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.getCertificateSignatureBySigner).
 * @param {string} req.body.userId - The id of the signer.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching signature and the rotated token.
 */
export const getCertificateSignatureBySigner = async (req, res, next) => {
  const { userId } = req.body;
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const theSignature = await certificateSignatureManager.getBySigner(userId);

    return res.status(200).json({
      success: true,
      message: 'Firma del certificado del firmante encontrada exitosamente',
      certificateSignature: theSignature,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar la firma del certificado para el firmante indicado',
    });
    next(boomError);
  }
};

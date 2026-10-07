import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to list every certificate signature.
 *
 * @param {Object} req - The Express request object (no body parameters required).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the full list and the rotated token.
 */
export const listAllCertificateSignatures = async (req, res, next) => {
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const { total, records } = await certificateSignatureManager.listAll();

    return res.status(200).json({
      success: true,
      message: 'Firmas de certificados encontradas exitosamente',
      total,
      certificateSignatures: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar las firmas de certificados en la base de datos',
    });
    next(boomError);
  }
};

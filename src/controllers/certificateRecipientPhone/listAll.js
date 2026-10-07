import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to list every CertificateRecipientPhone record.
 *
 * @param {Object} req - The Express request object (no body parameters required).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the full list and the rotated token.
 */
export const listAllCertificateRecipientPhones = async (req, res, next) => {
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const { total, records } = await certificateRecipientPhoneManager.listAll();

    return res.status(200).json({
      success: true,
      message: 'Vínculos receptor del certificado-teléfono encontrados exitosamente',
      total,
      certificateRecipientPhones: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los vínculos receptor del certificado-teléfono en la base de datos',
    });
    next(boomError);
  }
};

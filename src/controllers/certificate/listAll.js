import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve every certificate, ordered from most to least
 * recently issued (by issueDate DESC).
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object (no body parameters required).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the full list of certificates and the rotated token.
 */
export const listAllCertificates = async (req, res, next) => {
  const certificateManager = new CertificateServices();

  try {
    const allCertificates = await certificateManager.listAll();

    return res.status(200).json({
      success: true,
      message: 'Certificados encontrados exitosamente',
      certificates: allCertificates,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los certificados en la base de datos',
    });
    next(boomError);
  }
};

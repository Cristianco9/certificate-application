import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single certificate by its id.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.getCertificateById).
 * @param {string} req.body.id - The id of the certificate to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested certificate and the rotated token.
 */
export const listOneCertificate = async (req, res, next) => {
  const { id } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const theCertificate = await certificateManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Certificado encontrado exitosamente',
      certificate: theCertificate,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el certificado en la base de datos',
    });
    next(boomError);
  }
};

import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve all certificates with a given status.
 * Supports the status filter: EMITIDO, ANULADO, or REIMPRESO.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.listCertificatesByStatus).
 * @param {string} req.body.status - The status to filter by.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching certificates and the rotated token.
 */
export const listCertificatesByStatus = async (req, res, next) => {
  const { status } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const certificatesByStatus = await certificateManager.listByStatus(status);

    return res.status(200).json({
      success: true,
      message: 'Certificados encontrados exitosamente',
      certificates: certificatesByStatus,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los certificados para el estado indicado',
    });
    next(boomError);
  }
};

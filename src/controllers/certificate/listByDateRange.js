import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve all certificates issued within a given date range.
 * Supports dashboard/statistics requirements: indicators and charts.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.listCertificatesByDateRange).
 * @param {string} req.body.startDate - The start of the range (inclusive).
 * @param {string} req.body.endDate - The end of the range (inclusive).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching certificates and the rotated token.
 */
export const listCertificatesByDateRange = async (req, res, next) => {
  const { startDate, endDate } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const certificatesInRange = await certificateManager.listByDateRange(startDate, endDate);

    return res.status(200).json({
      success: true,
      message: 'Certificados encontrados exitosamente',
      certificates: certificatesInRange,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar los certificados en el rango de fechas indicado',
    });
    next(boomError);
  }
};

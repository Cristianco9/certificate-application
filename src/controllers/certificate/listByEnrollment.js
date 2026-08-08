import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve the certificate issued for a given enrollment, if any.
 * Since 'enrollmentId' is unique, at most one certificate can exist per enrollment.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.getCertificateByEnrollment).
 * @param {string} req.body.enrollmentId - The id of the enrollment.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching certificate and the rotated token.
 */
export const getCertificateByEnrollment = async (req, res, next) => {
  const { enrollmentId } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const theCertificate = await certificateManager.listByEnrollment(enrollmentId);

    return res.status(200).json({
      success: true,
      message: 'Certificado encontrado exitosamente',
      certificate: theCertificate,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el certificado para la matrícula indicada',
    });
    next(boomError);
  }
};

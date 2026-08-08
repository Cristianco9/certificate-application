import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to delete an existing certificate.
 * Note: For normal cancellation workflows, voidCertificate() should be preferred
 * over hard deletion, since context.md requires full traceability. deleteOne
 * remains available for correcting erroneous records that were never signed or printed.
 *
 * Extracts the certificate id from the request body, delegates the deletion to
 * CertificateServices (which guards against certificates with associated signatures),
 * and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.deleteCertificate).
 * @param {string} req.body.id - The id of the certificate to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneCertificate = async (req, res, next) => {
  const { id } = req.body;
  const certificateManager = new CertificateServices();

  try {
    const response = await certificateManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Certificado eliminado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el certificado de la base de datos',
    });
    next(boomError);
  }
};

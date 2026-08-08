import { CertificateServices } from '../../services/certificateServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to update the mutable fields of an existing certificate.
 * Only 'recipientId' and 'status' can be updated through this generic method.
 *
 * Extracts the certificate id and the fields to update from the request body,
 * delegates the update to CertificateServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSchema.updateCertificateData).
 * @param {string} req.body.id - The id of the certificate to update.
 * @param {string} [req.body.recipientId] - The new recipient id.
 * @param {string} [req.body.status] - The new certificate status.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneCertificate = async (req, res, next) => {
  const { id } = req.body;
  const newCertificateData = {
    recipientId: req.body.recipientId,
    status: req.body.status,
  };

  const certificateManager = new CertificateServices();

  try {
    const response = await certificateManager.updateOne(id, newCertificateData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Certificado actualizado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el certificado en la base de datos',
    });
    next(boomError);
  }
};

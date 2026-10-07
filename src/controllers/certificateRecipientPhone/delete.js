import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to delete a CertificateRecipientPhone record by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.deleteCertificateRecipientPhone).
 * @param {string} req.body.id - The id of the certificate-recipient-phone link to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneCertificateRecipientPhone = async (req, res, next) => {
  const { id } = req.body;
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const response = await certificateRecipientPhoneManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Teléfono desvinculado del receptor del certificado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible desvincular el teléfono del receptor del certificado en la base de datos',
    });
    next(boomError);
  }
};

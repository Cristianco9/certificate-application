import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to delete a certificate signature by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.deleteCertificateSignature).
 * @param {string} req.body.id - The id of the certificate signature to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneCertificateSignature = async (req, res, next) => {
  const { id } = req.body;
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const response = await certificateSignatureManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Firma del certificado eliminada exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar la firma del certificado de la base de datos',
    });
    next(boomError);
  }
};

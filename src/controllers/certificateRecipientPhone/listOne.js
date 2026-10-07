import { CertificateRecipientPhoneServices } from '../../services/certificateRecipientPhoneServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single CertificateRecipientPhone
 * record by id.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateRecipientPhoneSchema.getCertificateRecipientPhoneById).
 * @param {string} req.body.id - The id of the certificate-recipient-phone link to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested link and the rotated token.
 */
export const listOneCertificateRecipientPhone = async (req, res, next) => {
  const { id } = req.body;
  const certificateRecipientPhoneManager = new CertificateRecipientPhoneServices();

  try {
    const theLink = await certificateRecipientPhoneManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Vínculo receptor del certificado-teléfono encontrado exitosamente',
      certificateRecipientPhone: theLink,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el vínculo receptor del certificado-teléfono en la base de datos',
    });
    next(boomError);
  }
};

import { CertificateSignatureServices } from '../../services/certificateSignatureServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to list every signature executed in a given
 * municipality.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see certificateSignatureSchema.listCertificateSignaturesByMunicipality).
 * @param {string} req.body.municipalityId - The id of the municipality.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the matching signatures and the rotated token.
 */
export const listCertificateSignaturesByMunicipality = async (req, res, next) => {
  const { municipalityId } = req.body;
  const certificateSignatureManager = new CertificateSignatureServices();

  try {
    const { total, records } = await certificateSignatureManager.listByMunicipality(municipalityId);

    return res.status(200).json({
      success: true,
      message: 'Firmas de certificados del municipio encontradas exitosamente',
      total,
      certificateSignatures: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar las firmas del municipio indicado',
    });
    next(boomError);
  }
};

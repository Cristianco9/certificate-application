// Import the InstitutionServices class to manage institution-related database operations
import { InstitutionServices } from '../../services/institutionServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing institution.
 *
 * Extracts the institution id and the fields to update from the request body,
 * delegates the update to InstitutionServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionSchema.updateInstitutionData).
 * @param {string} req.body.id - The id of the institution to update.
 * @param {string} [req.body.name] - The new institution name.
 * @param {string} [req.body.institutionalCode] - The new institutional code.
 * @param {string} [req.body.address] - The new address.
 * @param {string} [req.body.municipalityId] - The new parent municipality id.
 * @param {string} [req.body.email] - The new email.
 * @param {string} [req.body.nitId] - The new NIT.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneInstitution = async (req, res, next) => {
  // Extract the institution id and the new data from the request body
  const { id } = req.body;
  const newInstitutionData = {
    name: req.body.name,
    institutionalCode: req.body.institutionalCode,
    address: req.body.address,
    municipalityId: req.body.municipalityId,
    email: req.body.email,
    nitId: req.body.nitId,
  };

  // Instantiate the service that manages institution operations
  const institutionManager = new InstitutionServices();

  try {
    // Attempt to update the institution using the provided data
    const response = await institutionManager.updateOne(id, newInstitutionData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Institución actualizada exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // InstitutionServices already throws boomified errors (e.g. notFound, conflict);
    // boomify() passes those through untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar la institución en la base de datos',
    });
    next(boomError);
  }
};

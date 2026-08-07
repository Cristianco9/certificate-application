// Import the InstitutionServices class to manage institution-related database operations
import { InstitutionServices } from '../../services/institutionServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new institution.
 *
 * Extracts the new institution data from the request body, delegates
 * the creation to InstitutionServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see institutionSchema.newInstitutionData).
 * @param {string} req.body.name - The name of the institution.
 * @param {string} req.body.institutionalCode - The institutional code (DANE).
 * @param {string} req.body.address - The institution address.
 * @param {string} [req.body.municipalityId] - The id of the parent municipality.
 * @param {string} req.body.email - The institution email.
 * @param {string} req.body.nitId - The tax identification number (NIT).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneInstitution = async (req, res, next) => {
  // Extract the new institution data from the request body
  const newInstitution = {
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
    // Attempt to create the institution using the provided data
    const response = await institutionManager.createOne(newInstitution);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Institución creada exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // InstitutionServices already throws boomified errors (e.g. conflict on
    // duplicate name/institutionalCode/nit); boomify() passes those through
    // untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear la institución en la base de datos',
    });
    next(boomError);
  }
};

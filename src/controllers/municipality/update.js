// Import the MunicipalityServices class to manage the municipality operations
import { MunicipalityServices } from '../../services/municipalityServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing municipality.
 *
 * Extracts the municipality id and the fields to update from the
 * request body, delegates the update to MunicipalityServices, and
 * responds according to the outcome. The rotated JWT is not signed
 * here: authAppVerifyToken already generated it upstream, wrote it to
 * the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The request object containing the municipality id and the new data.
 * @param {Object} req.body - The validated request body (see municipalitySchema.updateMunicipalityData).
 * @param {string} req.body.id - The id of the municipality to update.
 * @param {string} [req.body.name] - The new municipality name.
 * @param {string} [req.body.departmentId] - The new parent department id.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneMunicipality = async (req, res, next) => {
  // Extract the municipality id to update
  const { id } = req.body;

  // Extract only the fields that may be updated (name and/or departmentId)
  const newMunicipalityData = {
    name: req.body.name,
    departmentId: req.body.departmentId,
  };

  // Instantiate the MunicipalityServices class to manage the municipality operations
  const municipalityManager = new MunicipalityServices();

  try {
    // Attempt to update the municipality using the provided data
    const response = await municipalityManager.updateOne(id, newMunicipalityData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Municipio actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // MunicipalityServices already throws boomified errors (e.g. not
    // found, conflict); boomify() passes those through untouched and
    // only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el municipio en la base de datos',
    });
    next(boomError);
  }
};

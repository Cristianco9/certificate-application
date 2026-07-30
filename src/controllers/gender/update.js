// Import the GenderServices class to manage gender-related database operations
import { GenderServices } from '../../services/genderService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing gender.
 *
 * Extracts the gender id and the new name from the request body,
 * delegates the update to GenderServices, and responds according to
 * the outcome. The rotated JWT is not signed here: authAppVerifyToken
 * already generated it upstream, wrote it to the httpOnly
 * 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see genderSchema.updateGenderData).
 * @param {string} req.body.id - The id of the gender to update.
 * @param {string} req.body.name - The new name of the gender.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneGender = async (req, res, next) => {
  // Extract the gender id and the new data from the request body
  const { id } = req.body;
  const newGenderData = {
    name: req.body.name,
  };

  // Instantiate the service that manages gender operations
  const genderManager = new GenderServices();

  try {
    // Attempt to update the gender using the provided data
    const response = await genderManager.updateOne(id, newGenderData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Género actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // GenderServices already throws boomified errors (e.g. notFound,
    // conflict on duplicate name, bad request on invalid ENUM value);
    // boomify() passes those through untouched and only defaults
    // unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el género en la base de datos',
    });
    next(boomError);
  }
};

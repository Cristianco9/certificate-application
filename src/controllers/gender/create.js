// Import the GenderServices class to manage gender-related database operations
import { GenderServices } from '../../services/genderServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new gender.
 *
 * Extracts the new gender data from the request body, delegates the
 * creation to GenderServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see genderSchema.newGenderData).
 * @param {string} req.body.name - The name of the gender to create.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneGender = async (req, res, next) => {
  // Extract the new gender data from the request body
  const newGender = {
    name: req.body.name,
  };

  // Instantiate the service that manages gender operations
  const genderManager = new GenderServices();

  try {
    // Attempt to create the gender using the provided data
    const response = await genderManager.createOne(newGender);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Género creado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // GenderServices already throws boomified errors (e.g. conflict on
    // duplicate name, bad request on invalid ENUM value); boomify()
    // passes those through untouched and only defaults unexpected
    // errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el género en la base de datos',
    });
    next(boomError);
  }
};

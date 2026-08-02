// Import the CountryServices class to manage country-related database operations
import { CountryServices } from '../../services/countryServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete an existing country.
 *
 * Extracts the country id from the request body, delegates the deletion
 * to CountryServices (which guards against countries with associated
 * departments), and responds according to the outcome. The rotated JWT
 * is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same
 * value via res.locals.newUserToken for clients (e.g. the React SPA)
 * that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see countrySchema.deleteCountry).
 * @param {string} req.body.id - The id of the country to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneCountry = async (req, res, next) => {
  // Extract the country id from the request body
  const { id } = req.body;

  // Instantiate the service that manages country operations
  const countryManager = new CountryServices();

  try {
    // Attempt to delete the country
    const response = await countryManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'País eliminado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // CountryServices already throws boomified errors (e.g. notFound,
    // conflict when departments are still associated); boomify() passes
    // those through untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el país de la base de datos',
    });
    next(boomError);
  }
};

// Import the CountryServices class to manage country-related database operations
import { CountryServices } from '../../services/countryService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing country.
 *
 * Extracts the country id and the fields to update from the request body,
 * delegates the update to CountryServices, and responds according to the
 * outcome. The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see countrySchema.updateCountryData).
 * @param {string} req.body.id - The id of the country to update.
 * @param {string} [req.body.name] - The new name of the country.
 * @param {string} [req.body.iso2Code] - The new ISO 3166-1 alpha-2 code of the country.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneCountry = async (req, res, next) => {
  // Extract the country id and the new data from the request body
  const { id } = req.body;
  const newCountryData = {
    name: req.body.name,
    iso2Code: req.body.iso2Code,
  };

  // Instantiate the service that manages country operations
  const countryManager = new CountryServices();

  try {
    // Attempt to update the country using the provided data
    const response = await countryManager.updateOne(id, newCountryData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'País actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // CountryServices already throws boomified errors (e.g. notFound,
    // conflict on duplicate name); boomify() passes those through
    // untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el país en la base de datos',
    });
    next(boomError);
  }
};

// Import the CountryServices class to manage country-related database operations
import { CountryServices } from '../../services/countryServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new country.
 *
 * Extracts the new country data from the request body, delegates the
 * creation to CountryServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see countrySchema.newCountryData).
 * @param {string} req.body.name - The name of the country to create.
 * @param {string} [req.body.iso2Code] - The ISO 3166-1 alpha-2 code of the country.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneCountry = async (req, res, next) => {
  // Extract the new country data from the request body
  const newCountry = {
    name: req.body.name,
    iso2Code: req.body.iso2Code,
  };

  // Instantiate the service that manages country operations
  const countryManager = new CountryServices();

  try {
    // Attempt to create the country using the provided data
    const response = await countryManager.createOne(newCountry);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'País creado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // CountryServices already throws boomified errors (e.g. conflict on
    // duplicate name/ISO code); boomify() passes those through untouched
    // and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el país en la base de datos',
    });
    next(boomError);
  }
};

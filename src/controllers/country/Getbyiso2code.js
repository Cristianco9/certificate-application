// Import the CountryServices class to manage country-related database operations
import { CountryServices } from '../../services/countryServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single country by its ISO 3166-1
 * alpha-2 code.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see countrySchema.getCountryByIso2Code).
 * @param {string} req.body.iso2Code - The ISO code of the country to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the matching country and the rotated token.
 */
export const getCountryByIso2Code = async (req, res, next) => {
  // Extract the ISO code from the request body
  const { iso2Code } = req.body;

  // Instantiate the service that manages country operations
  const countryManager = new CountryServices();

  try {
    // Attempt to retrieve the country by its ISO code
    const theCountry = await countryManager.listByIso2Code(iso2Code);

    return res.status(200).json({
      success: true,
      message: 'País encontrado exitosamente',
      country: theCountry,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // CountryServices already throws boomified errors (e.g. notFound);
    // boomify() passes those through untouched and only defaults
    // unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el país por su código ISO',
    });
    next(boomError);
  }
};

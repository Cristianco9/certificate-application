// Import the GenderServices class to manage gender-related database operations
import { GenderServices } from '../../services/genderService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete an existing gender.
 *
 * Extracts the gender id from the request body, delegates the deletion
 * to GenderServices (which guards against genders with associated
 * users or students — a hard RESTRICT on 'usuario' and a soft
 * business-rule guard on 'estudiante' since that FK is SET NULL), and
 * responds according to the outcome. The rotated JWT is not signed
 * here: authAppVerifyToken already generated it upstream, wrote it to
 * the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see genderSchema.deleteGender).
 * @param {string} req.body.id - The id of the gender to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneGender = async (req, res, next) => {
  // Extract the gender id from the request body
  const { id } = req.body;

  // Instantiate the service that manages gender operations
  const genderManager = new GenderServices();

  try {
    // Attempt to delete the gender
    const response = await genderManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Género eliminado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // GenderServices already throws boomified errors (e.g. notFound,
    // conflict when users or students are still associated); boomify()
    // passes those through untouched and only defaults unexpected
    // errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el género de la base de datos',
    });
    next(boomError);
  }
};

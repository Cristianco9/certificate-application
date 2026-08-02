// Import the RoleServices class to manage role-related database operations
import { RoleServices } from '../../services/roleServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single role by its id.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see roleSchema.getRoleById).
 * @param {string} req.body.id - The id of the role to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the requested role and the rotated token.
 */
export const listOneRole = async (req, res, next) => {
  // Extract the role id from the request body
  const { id } = req.body;

  // Instantiate the service that manages role operations
  const roleManager = new RoleServices();

  try {
    // Attempt to retrieve the role
    const theRole = await roleManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Rol encontrado exitosamente',
      role: theRole,
      // Echo the token already rotated by authAppVerifyToken
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    // RoleServices already throws boomified errors (e.g. notFound);
    // boomify() passes those through untouched and only defaults
    // unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible encontrar el rol',
    });
    next(boomError);
  }
};

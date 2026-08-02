// Import the RoleServices class to manage role-related database operations
import { RoleServices } from '../../services/roleServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete an existing role.
 *
 * Extracts the role id from the request body, delegates the deletion to
 * RoleServices (which guards against roles with associated users — this
 * entity also drives role-based access control across the application,
 * see AGENTS.md section 7), and responds according to the outcome. The
 * rotated JWT is not signed here: authAppVerifyToken already generated
 * it upstream, wrote it to the httpOnly 'authentication' cookie, and
 * exposed the same value via res.locals.newUserToken for clients (e.g.
 * the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see roleSchema.deleteRole).
 * @param {string} req.body.id - The id of the role to delete.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneRole = async (req, res, next) => {
  // Extract the role id from the request body
  const { id } = req.body;

  // Instantiate the service that manages role operations
  const roleManager = new RoleServices();

  try {
    // Attempt to delete the role
    const response = await roleManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Rol eliminado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // RoleServices already throws boomified errors (e.g. notFound,
    // conflict when users are still associated); boomify() passes
    // those through untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el rol de la base de datos',
    });
    next(boomError);
  }
};

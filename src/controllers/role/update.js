// Import the RoleServices class to manage role-related database operations
import { RoleServices } from '../../services/roleService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing role.
 *
 * Extracts the role id and the fields to update from the request body,
 * delegates the update to RoleServices, and responds according to the
 * outcome. The rotated JWT is not signed here: authAppVerifyToken
 * already generated it upstream, wrote it to the httpOnly
 * 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients (e.g. the React SPA) that also
 * need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see roleSchema.updateRoleData).
 * @param {string} req.body.id - The id of the role to update.
 * @param {string} [req.body.name] - The new name of the role.
 * @param {string} [req.body.description] - The new description of the role.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneRole = async (req, res, next) => {
  // Extract the role id and the new data from the request body
  const { id } = req.body;
  const newRoleData = {
    name: req.body.name,
    description: req.body.description,
  };

  // Instantiate the service that manages role operations
  const roleManager = new RoleServices();

  try {
    // Attempt to update the role using the provided data
    const response = await roleManager.updateOne(id, newRoleData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // RoleServices already throws boomified errors (e.g. notFound,
    // conflict on duplicate name, bad request on invalid ENUM value);
    // boomify() passes those through untouched and only defaults
    // unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el rol en la base de datos',
    });
    next(boomError);
  }
};

// Import the RoleServices class to manage role-related database operations
import { RoleServices } from '../../services/roleService.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new role.
 *
 * Extracts the new role data from the request body, delegates the
 * creation to RoleServices, and responds according to the outcome. The
 * rotated JWT is not signed here: authAppVerifyToken already generated
 * it upstream, wrote it to the httpOnly 'authentication' cookie, and
 * exposed the same value via res.locals.newUserToken for clients (e.g.
 * the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see roleSchema.newRoleData).
 * @param {string} req.body.name - The name of the role to create.
 * @param {string} req.body.description - The description of the role to create.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneRole = async (req, res, next) => {
  // Extract the new role data from the request body
  const newRole = {
    name: req.body.name,
    description: req.body.description,
  };

  // Instantiate the service that manages role operations
  const roleManager = new RoleServices();

  try {
    // Attempt to create the role using the provided data
    const response = await roleManager.createOne(newRole);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // RoleServices already throws boomified errors (e.g. conflict on
    // duplicate name, bad request on invalid ENUM value); boomify()
    // passes those through untouched and only defaults unexpected
    // errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el rol en la base de datos',
    });
    next(boomError);
  }
};

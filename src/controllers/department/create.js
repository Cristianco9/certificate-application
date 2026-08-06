// Import the DepartmentServices class to manage the department operations
import { DepartmentServices } from '../../services/departmentServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new department.
 *
 * Handles the request to create a new department by extracting the
 * necessary data from the request body, invoking the corresponding
 * service method, and returning a response based on the operation's
 * success or failure. Follows the Router -> Controller -> Service ->
 * Model pipeline described in AGENTS.md; this controller never talks
 * to Sequelize directly.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The request object containing the department's data.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneDepartment = async (req, res, next) => {
  // Extract the new department data from the request body
  const newDepartment = {
    name: req.body.name,
    countryId: req.body.countryId,
  };

  // Instantiate the DepartmentServices class to manage the department operations
  const departmentManager = new DepartmentServices();

  try {
    // Attempt to create a new department using the provided data
    const response = await departmentManager.createOne(newDepartment);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Departamento creado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // DepartmentServices already throws boomified errors (e.g. conflict
    // on duplicate name/country); boomify() passes those through
    // untouched and only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el departamento en la base de datos',
    });
    next(boomError);
  }
};

// Import the DepartmentServices class to manage the department operations
import { DepartmentServices } from '../../services/departmentServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete a department.
 *
 * Handles the request to delete a department by extracting its id from
 * the request body, invoking the corresponding service method, and
 * returning a response based on the operation's success or failure.
 * The service layer guarantees a department is never deleted while it
 * still has associated municipalities (RESTRICT constraint).
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The request object containing the department id.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const deleteOneDepartment = async (req, res, next) => {
  // Extract the department id to delete
  const { id } = req.body;

  // Instantiate the DepartmentServices class to manage the department operations
  const departmentManager = new DepartmentServices();

  try {
    // Attempt to delete the department
    const response = await departmentManager.deleteOne(id);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Departamento eliminado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // DepartmentServices already throws boomified errors (e.g. not
    // found, or a conflict because associated municipalities still
    // exist); boomify() passes those through untouched and only
    // defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible eliminar el departamento de la base de datos',
    });
    next(boomError);
  }
};

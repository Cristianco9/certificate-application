// Import the DepartmentServices class to manage the department operations
import { DepartmentServices } from '../../services/departmentServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing department.
 *
 * Handles the request to update a department by extracting the
 * department id and the fields to update from the request body,
 * invoking the corresponding service method, and returning a response
 * based on the operation's success or failure.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The request object containing the department id and the new data.
 * @param {Object} res - The response object used to send the outcome of the operation.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneDepartment = async (req, res, next) => {
  // Extract the department id to update
  const { id } = req.body;

  // Extract only the fields that may be updated (name and/or countryId)
  const newDepartmentData = {
    name: req.body.name,
    countryId: req.body.countryId,
  };

  // Instantiate the DepartmentServices class to manage the department operations
  const departmentManager = new DepartmentServices();

  try {
    // Attempt to update the department using the provided data
    const response = await departmentManager.updateOne(id, newDepartmentData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Departamento actualizado exitosamente',
        // Echo the token already rotated by authAppVerifyToken
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    // DepartmentServices already throws boomified errors (e.g. not
    // found, conflict); boomify() passes those through untouched and
    // only defaults unexpected errors to a 500.
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el departamento en la base de datos',
    });
    next(boomError);
  }
};

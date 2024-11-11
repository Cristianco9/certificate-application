// Import the UserServices class from the userServices module
import { UserServices } from '../../services/userServices.js';
// Import Boom to create HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to handle the update of an user.
 *
 * This function processes requests to update a user's details in the database. It accepts
 * the user ID and the new user data from the request body. If the update is successful,
 * it returns a success message. If there's an error, it handles the error appropriately.
 *
 * @param {Object} req - The request object, expected to contain the user ID and new user data in the body.
 * @param {Object} res - The response object to send the result of the update operation.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with a success message, or an error if the update fails.
 */
export const updateOneUser = async (req, res, next) => {

  // Extract user ID and new user data from the request body
  const { id, newUserData } = req.body;

  // Instantiate the UserServices class to manage user operations
  const userManager = new UserServices();

  try {
    // Attempt to update the user details in the database
    const response = await userManager.updateOne(id, newUserData);

    // If the update is successful, return a 201 response with a success message
    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'User updated successfully',
        // Include the new token in the response
        authentication: res.locals.newUserToken
      });
    }

  } catch (error) {
    // Handle errors during the update process by returning a 503 error
    const boomError = Boom.serverUnavailable(
      'No es posible actualizar el usuario en la base de datos',
      error
    );
    next(boomError);
  }
};

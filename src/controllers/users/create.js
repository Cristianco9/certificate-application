// Import the UserServices class from the userServices module
import { UserServices } from '../../services/userServices.js';
// Import Boom for handling HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to create a new user.
 *
 * This function handles the request to create a new user by extracting
 * the necessary data from the request body, invoking the appropriate service
 * method, and returning a response based on the operation's success or failure.
 *
 * @param {Object} req - The request object containing the user's data.
 * @param {Object} res - The response object to send the outcome of the operation.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with the operation result.
 */
export const createOneUser = async (req, res, next) => {

  // Extract username and password from the request body
  const newUser = {
    username: req.body.newUserData.username,
    password: req.body.newUserData.password,
    email: req.body.newUserData.email,
    firstName: req.body.newUserData.firstName,
    middleName: req.body.newUserData.middleName,
    firstLastName: req.body.newUserData.firstLastName,
    secondLastName: req.body.newUserData.secondLastName,
  };

  // Instantiate the UserServices class to manage the users operations
  const userManager = new UserServices();

  try {
    // Attempt to create a new user using the provided data
    const response = await userManager.createOne(newUser);

    // If the user is created successfully, send a success response
    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        // Include the new token in the response
        authentication: res.locals.newUserToken
      });
    }

  } catch (error) {
    // Handle errors during user creation by sending a Boom error response
    const boomError = Boom.serverUnavailable(
      'Unable to create the user in the database',
      error
    );
    // Pass the Boom error to the next middleware in the stack
    next(boomError);
  }
};

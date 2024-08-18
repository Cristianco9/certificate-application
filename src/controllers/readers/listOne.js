// Import the ReaderServices class from the readerServices module
import { ReaderServices } from '../../services/readerServices.js';
// Import Boom for handling HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single reader user by ID.
 *
 * This function handles the request to find a specific reader user in the database
 * based on the provided ID. It calls the appropriate service method and returns
 * the user data if found. If an error occurs or the user is not found, it is handled
 * appropriately using Boom.
 *
 * @param {Object} req - The request object, expected to contain the user ID in the body.
 * @param {Object} res - The response object to send the user data if found.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with the user data or an error.
 */
export const listOneReader = async (req, res, next) => {

  // Destructure the user ID from the request body
  const { id } = req.body;

  // Instantiate the ReaderServices class to manage reader operations
  const readerManager = new ReaderServices();

  try {
    // Attempt to find the reader user record by ID
    const record = await readerManager.listOne(id);

    // If the user record is found, send a success response with the user data
    if (record) {
      return res.status(201).json({
        success: true,
        message: 'User found successfully',
        // Include the new token in the response
        authentication: res.locals.newUserToken,
        user: record
      });
    }

  } catch (error) {
    // Handle errors during the user retrieval process by sending a Boom error response
    const boomError = Boom.serverUnavailable(
      'Unable to retrieve the user from the database',
      error
    );
    // Pass the Boom error to the next middleware in the stack
    next(boomError);
  }
};

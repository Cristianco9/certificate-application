// Import the ReaderServices class from the readerServices module
import { ReaderServices } from '../../services/readerServices.js';
// Import Boom for handling HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to delete a reader user.
 *
 * This function handles the request to delete an existing reader user by extracting
 * the user ID from the request body, invoking the appropriate service method, and
 * returning a response based on the operation's success or failure.
 *
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the outcome of the operation.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with the operation result.
 */
export const deleteOneReader = async (req, res, next) => {

  // Extract the user ID from the request body
  const { id } = req.body;

  // Instantiate the ReaderServices class to manage the reader operations
  const readerManager = new ReaderServices();

  try {
    // Attempt to delete the reader user by the provided ID
    const response = await readerManager.deleteOne(id);

    // If the user is deleted successfully, send a success response
    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'User deleted successfully',
        // Include the new token in the response
        authentication: res.locals.newUserToken
      });
    }

  } catch (error) {
    // Handle errors during user deletion by sending a Boom error response
    const boomError = Boom.serverUnavailable(
      'Unable to delete the user from the database',
      error
    );
    // Pass the Boom error to the next middleware in the stack
    next(boomError);
  }
};

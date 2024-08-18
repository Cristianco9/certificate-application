// Import the ReaderServices class from the readerServices module
import { ReaderServices } from '../../services/readerServices.js';
// Import Boom for handling HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to list all reader users.
 *
 * This function handles the request to retrieve all reader users from the database,
 * invoking the appropriate service method and returning a response with the list of users.
 * If an error occurs during the operation, it is handled gracefully using Boom.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the list of users.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with the list of users.
 */
export const listAllReader = async (req, res, next) => {

  // Instantiate the ReaderServices class to manage the reader operations
  const readerManager = new ReaderServices();

  try {
    // Attempt to retrieve all reader user records from the database
    const allRecords = await readerManager.listAll();

    // If records are found, send a success response with the user data
    if (allRecords) {
      return res.status(201).json({
        success: true,
        message: 'Users retrieved successfully',
        // Include the new token in the response
        authentication: res.locals.newUserToken,
        users: allRecords
      });
    }

  } catch (error) {
    // Handle errors during user retrieval by sending a Boom error response
    const boomError = Boom.serverUnavailable(
      'Unable to retrieve users from the database',
      error
    );
    // Pass the Boom error to the next middleware in the stack
    next(boomError);
  }
};

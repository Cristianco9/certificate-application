import { UserServices } from '../../services/userServices.js';

/**
 * Controller function to authenticate a user and start a session.
 *
 * Extracts the user's credentials from the request body, delegates
 * authentication to UserServices, and returns a JSON response
 * according to the authentication result.
 *
 * On successful authentication, the JWT returned by the service
 * is stored in an HTTP-only cookie.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {Object} req.body.credentials - The user's login credentials.
 * @param {string} req.body.credentials.username - The user's username/email.
 * @param {string} req.body.credentials.password - The user's password.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the Express stack.
 * @returns {Promise<Response>} JSON authentication response.
 */
export const login = async (req, res, next) => {
  const { username, password } = req.body.credentials;

  const userManager = new UserServices();

  try {
    const response = await userManager.login(username, password);

    /*
     * Authentication failed.
     *
     * Use the same response for both "user not found" and
     * "wrong password" to prevent user enumeration.
     */
    if (
      response.status === 'user not found' ||
      response.status === 'wrong password'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
        error: 'INVALID_CREDENTIALS',
      });
    }

    /*
     * Authentication successful.
     *
     * The UserServices layer has already generated the JWT,
     * so there is no need to generate another token here.
     */
    if (response.status === 'logged') {
      const token = response.token;

      res.cookie('authentication', token, {
        httpOnly: true,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
      });
    }

    /*
     * Handle an unexpected authentication status.
     */
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during authentication.',
      error: 'AUTHENTICATION_ERROR',
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
};

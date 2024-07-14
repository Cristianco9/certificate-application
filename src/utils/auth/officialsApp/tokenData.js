// Import the verifyToken function from the tokenVerify.js module
import { verifyToken } from '../tokenVerify.js';
// Import the config object which contains the application configuration settings
import { config } from '../../config/config.js';

/**
 * Extracts the user role from a given JWT.
 *
 * @param {string} token
 * - The JWT to be verified and decoded.
 * @returns {string|null}
 * - The user role if the token is valid, otherwise null.
 */
export const getUserRole = (token) => {
  if (!token) {
    // Return null if no token is provided
    return null;
  }

  try {
    // Verify the token using the secret key from the config and decode it
    const decoded = verifyToken(token, config.officialsAppJwtKey);
    // Return the user role from the decoded token
    return decoded.role;
  } catch (err) {
    // Return null if token verification fails
    return null;
  }
};

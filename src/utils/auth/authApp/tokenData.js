// Import the verifyToken function from the tokenVerify.js module
import { verifyToken } from '../tokenVerify.js';
// Import the config object which contains the application configuration settings
import { config } from '../../config/config.js';

/**
 * Extracts the user information from a given JWT.
 *
 * @param {string} token - The JWT to be verified and decoded.
 * @returns {string|null} - The user information if the token is valid,
 * otherwise null.
 */
export const getUserData = (token) => {
  if (!token) {
    // Return null if no token is provided
    return null;
  }

  try {
    // Verify the token using the secret key from the config and decode it
    const decoded = verifyToken(token, config.authAppJwtKey);
    // Return the student fingerprint hash from the decoded token
    return decoded.userData;
  } catch (err) {
    // Return null if token verification fails
    return null;
  }
};

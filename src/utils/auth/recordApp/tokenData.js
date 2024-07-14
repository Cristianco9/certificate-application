// Import the verifyToken function from the tokenVerify.js module
import { verifyToken } from '../tokenVerify.js';
// Import the config object which contains the application configuration settings
import { config } from '../../config/config.js';

/**
 * Extracts the student ID from a given JWT.
 *
 * @param {string} token
 * - The JWT to be verified and decoded.
 * @returns {string|null}
 * - The student ID if the token is valid, otherwise null.
 */
export const getStudentID = (token) => {
  if (!token) {
    // Return null if no token is provided
    return null;
  }

  try {
    // Verify the token using the secret key from the config and decode it
    const decoded = verifyToken(token, config.recordAppJwtKey);
    // Return the student ID from the decoded token
    return decoded.studentID;
  } catch (err) {
    // Return null if token verification fails
    return null;
  }
};

/**
 * Extracts the entire student data from a given JWT.
 *
 * @param {string} token
 * - The JWT to be verified and decoded.
 * @returns {object|null}
 * - The decoded token containing student data if the token is valid,
 * otherwise null.
 */
export const getStudentData = (token) => {
  if (!token) {
    // Return null if no token is provided
    return null;
  }

  try {
    // Verify the token using the secret key from the config and decode it
    const decoded = verifyToken(token, config.recordAppJwtKey);
    // Return the entire decoded token containing student data
    return decoded;
  } catch (err) {
    // Return null if token verification fails
    return null;
  }
};

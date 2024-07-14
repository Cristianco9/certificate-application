// Import the jsonwebtoken library for handling JWT operations
import jwt from 'jsonwebtoken';

/**
 * Verifies a given JSON Web Token (JWT).
 *
 * @param {string} token
 * - The JWT to be verified.
 * @param {string} secret
 * - The secret or private key to verify the token.
 * @returns {object|string}
 * - The decoded token if the verification is successful.
 *   Throws an error if the token is invalid or verification fails.
 */

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

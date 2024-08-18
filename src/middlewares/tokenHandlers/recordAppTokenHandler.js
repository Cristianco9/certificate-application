import { config } from '../config/config.js';
import { signUserToken } from '../utils/auth/tokenSign.js';
import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT tokens for the application.
 * Regenerates a new token if the old one is valid.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const authAppVerifyToken = (req, res, next) => {
  const authenticationToken = req.body.authentication;

  // Check for the presence of the authentication token
  if (!authenticationToken) {
    return res.status(403).json({
      error: 'Access Denied: No authentication token provided.'
    });
  }

  // Verify the token using the secret key
  jwt.verify(authenticationToken, config.officialsAppJwtKey, (err, decoded) => {
    if (err) {
      // Handle specific JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired.' });
      } else {
        return res.status(401).json({ error: 'Invalid token.' });
      }
    }

    // Extract user data from the decoded token
    const userData = {
      id: decoded.id,
    };

    // Regenerate a new token for the user
    const newUserToken = signUserToken(userData, config.authAppJwtKey, '30m');

    // Send the new token back to the client
    res.status(202).json({
      authentication: newUserToken
    });

    // Attach user data to the request object for later use
    req.user = decoded;

    // Proceed to the next middleware
    next();
  });
};

import { verifyToken } from '../utils/auth/tokenVerify.js';
import { config } from '../config/config.js';

/**
 * Middleware to check user roles based on the provided token.
 *
 * @param {Array<string>} roles
 * - The roles that are allowed to access the route.
 * @returns {Function}
 * - Middleware function for role checking.
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    // Extract the authentication token from the request body
    const authenticationToken = req.body.authentication;

    // Check if the token is provided
    if (!authenticationToken) {
      return res.status(403).json({
        error: 'Access Denied: No authentication token provided.'
      });
    }

    try {
      // Verify the token
      const user = verifyToken(authenticationToken, config.officialsAppJwtKey);

      // Check if user role is valid and authorized
      if (!user || !user.role || !roles.includes(user.role)) {
        return res.status(403).json({
          error: 'Unauthorized: Insufficient permissions.'
        });
      }

      // Attach user information to the request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Token Invalid: ' + error.message
      });
    }
  };
};

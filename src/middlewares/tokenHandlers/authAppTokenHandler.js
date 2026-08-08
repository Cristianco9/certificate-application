import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';
import { signUserToken } from '../../utils/auth/tokenSign.js';

/**
 * Middleware to authenticate API requests using a JWT stored
 * in an HTTP-only cookie.
 *
 * If the token is valid, a new token is generated and the
 * authentication cookie is refreshed.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Response|void}
 */
export const authAppVerifyToken = (req, res, next) => {
  const authenticationToken = req.cookies?.authentication;

  // No authentication token was provided.
  if (!authenticationToken) {
    return res.status(401).json({
      success: false,
      message:
        'Authentication required. Please sign in to access this resource.',
      error: 'AUTHENTICATION_REQUIRED',
    });
  }

  jwt.verify(
    authenticationToken,
    config.authAppJwtKey,
    (err, decoded) => {
      // Token validation failed.
      if (err) {
        res.clearCookie('authentication');

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message:
              'Your session has expired. Please sign in again.',
            error: 'TOKEN_EXPIRED',
          });
        }

        return res.status(401).json({
          success: false,
          message:
            'Invalid authentication credentials. Please sign in again.',
          error: 'INVALID_TOKEN',
        });
      }

      // Extract only the claims required by the application.
      const userData = {
        id: decoded.id,
        role: decoded.role,
      };

      // Generate a fresh token to extend the session.
      const newUserToken = signUserToken(
        userData,
        config.authAppJwtKey,
        '1h'
      );

      // Refresh the authentication cookie.
      res.cookie('authentication', newUserToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });

      // Attach authenticated user data to the request.
      req.user = userData;

      return next();
    }
  );
};

import { verifyToken } from '../utils/auth/tokenVerify.js';
import { config } from '../config/config.js';

/**
 * Middleware to check user roles based on the decoded JWT payload.
 *
 * This middleware assumes it always runs AFTER authAppVerifyToken in the
 * route pipeline (see AGENTS.md section 7): authAppVerifyToken is the one
 * responsible for reading the 'authentication' httpOnly cookie, verifying
 * the JWT, and setting req.user = decoded. checkRole does NOT re-verify
 * the token itself — it only authorizes based on the role already decoded
 * upstream. This also means the role check only works correctly if the
 * signed token payload actually includes a 'role' claim (see
 * UserServices.login, which signs { id, role } on successful login).
 *
 * @param {Array<string>} roles
 * - The roles that are allowed to access the route.
 * @returns {Function}
 * - Middleware function for role checking.
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    // req.user is populated by authAppVerifyToken upstream; if it's
    // missing, either the pipeline order is wrong or the session was
    // never established
    if (!req.user) {
      return res.status(403).json({
        error: 'Access Denied: No authentication token provided.'
      });
    }

    // Check if the user's role is present and authorized for this route
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Unauthorized: Insufficient permissions.'
      });
    }

    // req.user is already attached by authAppVerifyToken; nothing further to set
    next();
  };
};

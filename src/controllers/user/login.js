import { UserServices } from '../../services/userServices.js';
import { signUserToken } from '../../utils/auth/tokenSign.js';
import { config } from '../../config/config.js';

/**
 * Controller function to authenticate a user and start a session.
 *
 * Extracts the credentials from the request body, delegates authentication
 * to UserServices, and responds according to the outcome.
 * On success, it generates a JWT, stores it in an httpOnly cookie, and
 * returns a success response so the frontend can redirect to the dashboard.
 * On failure, it renders the authError view with the appropriate message.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {Object} req.body.credentials - The login credentials.
 * @param {string} req.body.credentials.username - The user's email (used as username).
 * @param {string} req.body.credentials.password - The user's password.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response on success, or renders an error view on failure.
 */
export const login = async (req, res, next) => {
  const { username, password } = req.body.credentials;

  const userManager = new UserServices();

  try {
    const response = await userManager.login(username, password);

    if (response.status === 'user not found') {
      return res.status(401).render('authError', {
        message: 'Usuario no encontrado. Verifique sus credenciales.',
        type: 'user',
      });
    }

    if (response.status === 'wrong password') {
      return res.status(401).render('authError', {
        message: 'Contraseña incorrecta. Intente nuevamente.',
        type: 'password',
      });
    }

    if (response.status === 'logged') {
      // Generate a session token (the service already generated one, but we need to set the cookie)
      // However, the service already generated the token and returned it in response.token.
      // We can either use that token or generate a new one here for consistency.
      // To keep it consistent with the authAppVerifyToken middleware, we use signUserToken
      // with the same secret and expiration.
      // But the service already signed it with the same secret? Let's check: In userServices.js,
      // signUserToken is called with config.authAppJwtKey and '1h'. So the token is already valid.
      // We can just use the token from the response.
      const token = response.token;

      // Set the cookie with httpOnly flag
      res.cookie('authentication', token, {
        httpOnly: true,
        // secure: true, // Enable in production with HTTPS
        // sameSite: 'lax',
        // maxAge: 3600000, // 1 hour
      });

      // Return success response; frontend will redirect to dashboard
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
      });
    }

    // Fallback for unexpected status
    return res.status(500).render('authError', {
      message: 'Ocurrió un error inesperado durante el inicio de sesión.',
      type: 'token-inv',
    });
  } catch (error) {
    // If an unexpected error occurs, render a generic error view
    console.error('Login error:', error);
    return res.status(500).render('authError', {
      message: 'Error de conexión con el servidor. Intente más tarde.',
      type: 'no-token',
    });
  }
};

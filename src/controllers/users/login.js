// Import the UserServices class from the userServices module
import { UserServices } from '../../services/userServices.js';
// Import Boom to create HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to handle user login.
 *
 * This function processes login requests by validating the provided username and password
 * against the records in the database. Depending on the validation result, it returns an
 * appropriate response: a successful login with a JWT token, an error if the user is not
 * found, or if the password is incorrect.
 *
 * @param {Object} req - The request object, expected to contain username and password in the body.
 * @param {Object} res - The response object to send the result of the login operation.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Returns a JSON response with a success message and token, or an error.
 */
export const loginUser = async (req, res, next) => {

  // Extract username and password from the request body
  const { username, password } = req.body.credentials;

  // Instantiate the UserServices class to manage user operations
  const userManager = new UserServices();

  try {
    // Attempt to log in the user by validating the credentials
    const response = await userManager.login(username, password);

    let message = "";

    // Handle different outcomes of the login attempt
    switch (response.status) {
      case 'user not found':
        // If the user is not found in the database, return a 404 error view
        message = "Usuario incorrecto. Por favor verifique e intente de nuevo.";
        return res.status(404).render("authError", { message: message, type: "user" });
      case 'wrong password':
        // If the password is incorrect, return a 401 error view
        message = "Contraseña incorrecta. Por favor verifique e intente de nuevo.";
        return res.status(401).render("authError", { message: message, type: "password" });
      case 'logged':
        // If login is successful, return a 200, send a cookie with the token,
        // and dashboard view
        res.cookie('authentication', response.token, { httpOnly: true });
        return res.status(200).render("dashboard");
      default:
        // Handle any unexpected cases with a 500 error
        return next(Boom.badImplementation('Servicio no disponible'));
    }
  } catch (error) {
    // Handle errors during the login process by returning a 503 error
    return next(Boom.serverUnavailable(
      'No es posible verificar las credenciales del usuario en la base de datos',
      error
    ));
  }
};

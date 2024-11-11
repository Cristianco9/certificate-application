// Import Boom for handling HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to render an login form HTML template.
 *
 * This function handles the request to display a login view to have access to
 * the application. Returning a response rendering a HTML template
 *
 * @param {Object} req - The request object containing the data sended in the request
 * @param {Object} res - The response rendering a HTML template a throw views template engine
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {html} - Return rendering a HTML template
 */
export const loginForm = async (req, res, next) => {
  try {
    res.render('loginForm');
  } catch (err) {
    const boomError = Boom.notImplemented(
      'No es posible renderizar la vista de formulario de inicio de sección',
      err);
    next(boomError);
  }
};

// Import Boom for handling HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to render a certificates academic form HTML template.
 *
 * This function handles the request to display a form view to fill the student
 * data to request certificates. Returning a response rendering a HTML template
 *
 * @param {Object} req - The request object containing the data sended in the request
 * @param {Object} res - The response rendering a HTML template a throw views template engine
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {html} - Return rendering a HTML template
 */
export const certificateAcademicForm = async (req, res, next) => {
  try {
    res.render('certificateAcademicForm');
  } catch (err) {
    const boomError = Boom.notImplemented(
      'No es posible renderizar la vista de formulario de certificados académicos',
      err);
    next(boomError);
  }
};

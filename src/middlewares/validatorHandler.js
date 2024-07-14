// Import the Boom library for HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Middleware for validating request data against a Joi schema.
 *
 * @param {Object} schema - The Joi schema to validate against.
 * @param {string} property - The property of the request object
 * to validate (e.g., 'body', 'params', 'query').
 * @returns {Function} - A middleware function for validation.
 */
export const validatorHandler = (schema, property) => {
  // Return a middleware function
  return (req, res, next) => {
    // Extract the data from the specified property of the request object
    const data = req[property];

    // Validate the data against the provided schema with Joi
    const { error } = schema.validate(data, { abortEarly: false });

    // If there is a validation error, create a Boom bad request error and
    // pass it to the next middleware
    if (error) {
      const boomError = Boom.badRequest(error);
      next(boomError);
    }

    // If no error, proceed to the next middleware
    next();
  }
}

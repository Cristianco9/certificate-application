import { GroupServices } from '../../services/groupServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to retrieve a single group by its id.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see groupSchema.getGroupById).
 * @param {string} req.body.id - The id of the group to retrieve.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the requested group and the rotated token.
 */
export const listOneGroup = async (req, res, next) => {
  const { id } = req.body;
  const groupManager = new GroupServices();

  try {
    const theGroup = await groupManager.listOne(id);

    return res.status(200).json({
      success: true,
      message: 'Grupo encontrado exitosamente',
      group: theGroup,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible consultar el grupo en la base de datos',
    });
    next(boomError);
  }
};

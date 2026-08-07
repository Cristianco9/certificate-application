import { GroupServices } from '../../services/groupServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to create a new group.
 *
 * Extracts the new group data from the request body, delegates the creation
 * to GroupServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see groupSchema.newGroupData).
 * @param {string} req.body.name - The group name (e.g. '11-A').
 * @param {string} req.body.year - The academic year (e.g. '2026').
 * @param {string} [req.body.gradeId] - The id of the associated grade.
 * @param {string} req.body.shift - The school day shift ('DIURNA' or 'NOCTURNA').
 * @param {string} [req.body.institutionId] - The id of the associated institution.
 * @param {string} req.body.status - The group status ('ACTIVO' or 'INACTIVO').
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneGroup = async (req, res, next) => {
  const newGroup = {
    name: req.body.name,
    year: req.body.year,
    gradeId: req.body.gradeId,
    shift: req.body.shift,
    institutionId: req.body.institutionId,
    status: req.body.status,
  };

  const groupManager = new GroupServices();

  try {
    const response = await groupManager.createOne(newGroup);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Grupo creado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el grupo en la base de datos',
    });
    next(boomError);
  }
};

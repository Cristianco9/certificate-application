import { GroupServices } from '../../services/groupServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing group.
 *
 * Extracts the group id and the fields to update from the request body,
 * delegates the update to GroupServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see groupSchema.updateGroupData).
 * @param {string} req.body.id - The id of the group to update.
 * @param {string} [req.body.name] - The new group name.
 * @param {string} [req.body.year] - The new academic year.
 * @param {string} [req.body.gradeId] - The new associated grade id.
 * @param {string} [req.body.shift] - The new school day shift.
 * @param {string} [req.body.institutionId] - The new associated institution id.
 * @param {string} [req.body.status] - The new group status.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneGroup = async (req, res, next) => {
  const { id } = req.body;
  const newGroupData = {
    name: req.body.name,
    year: req.body.year,
    gradeId: req.body.gradeId,
    shift: req.body.shift,
    institutionId: req.body.institutionId,
    status: req.body.status,
  };

  const groupManager = new GroupServices();

  try {
    const response = await groupManager.updateOne(id, newGroupData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Grupo actualizado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el grupo en la base de datos',
    });
    next(boomError);
  }
};

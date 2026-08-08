import { UserServices } from '../../services/userServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to update an existing user.
 *
 * Extracts the user id and the fields to update from the request body,
 * delegates the update to UserServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userSchema.updateUserData).
 * @param {string} req.body.id - The id of the user to update.
 * @param {string} [req.body.firstName] - The new first name(s).
 * @param {string} [req.body.lastName] - The new last name(s).
 * @param {string} [req.body.documentTypeId] - The new document type id.
 * @param {string} [req.body.documentNumber] - The new document number.
 * @param {string} [req.body.municipalityId] - The new municipality id.
 * @param {string} [req.body.roleId] - The new role id.
 * @param {string} [req.body.academicLevelId] - The new academic level id.
 * @param {string} [req.body.email] - The new email.
 * @param {string} [req.body.status] - The new status.
 * @param {string} [req.body.password] - The new password (plain-text).
 * @param {string} [req.body.genderId] - The new gender id.
 * @param {string} [req.body.lastLogin] - The new last login date.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const updateOneUser = async (req, res, next) => {
  const { id } = req.body;
  const newUserData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    documentTypeId: req.body.documentTypeId,
    documentNumber: req.body.documentNumber,
    municipalityId: req.body.municipalityId,
    roleId: req.body.roleId,
    academicLevelId: req.body.academicLevelId,
    email: req.body.email,
    status: req.body.status,
    password: req.body.password,
    genderId: req.body.genderId,
    lastLogin: req.body.lastLogin,
  };

  const userManager = new UserServices();

  try {
    const response = await userManager.updateOne(id, newUserData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible actualizar el usuario en la base de datos',
    });
    next(boomError);
  }
};

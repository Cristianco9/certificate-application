import { UserServices } from '../../services/userServices.js';
import Boom from '@hapi/boom';

/**
 * Controller function to create a new user.
 *
 * Extracts the new user data from the request body, delegates the creation
 * to UserServices, and responds according to the outcome.
 * The rotated JWT is not signed here: authAppVerifyToken already generated it upstream,
 * wrote it to the httpOnly 'authentication' cookie, and exposed the same value via
 * res.locals.newUserToken for clients that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see userSchema.newUserData).
 * @param {string} req.body.username - The user's username.
 * @param {string} req.body.firstName - The user's first name(s).
 * @param {string} req.body.lastName - The user's last name(s).
 * @param {string} req.body.documentTypeId - The id of the document type.
 * @param {string} req.body.documentNumber - The document number.
 * @param {string} req.body.municipalityId - The id of the municipality.
 * @param {string} req.body.roleId - The id of the role.
 * @param {string} req.body.academicLevelId - The id of the academic level.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.status - The user's status (ACTIVO/INACTIVO).
 * @param {string} req.body.password - The plain-text password.
 * @param {string} req.body.genderId - The id of the gender.
 * @param {string} [req.body.lastLogin] - The last login date (optional).
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * @returns {Promise<void>} - Sends a JSON response with the operation result and the rotated token.
 */
export const createOneUser = async (req, res, next) => {
  const newUser = {
    username: req.body.username,
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
    const response = await userManager.createOne(newUser);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        authentication: res.locals.newUserToken,
      });
    }
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible crear el usuario en la base de datos',
    });
    next(boomError);
  }
};

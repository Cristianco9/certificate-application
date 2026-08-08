// import the user data model
import { User } from '../db/models/user.js';
// import the related catalog models needed to embed FK data as nested objects
import { Role } from '../db/models/role.js';
import { DocumentType } from '../db/models/documentType.js';
import { Municipality } from '../db/models/municipality.js';
import { AcademicLevel } from '../db/models/academicLevel.js';
import { Gender } from '../db/models/gender.js';
// import the promise to encrypt the user's password
import { hashPassword } from '../utils/auth/passwordHash.js';
// import the module to sign a JWT
import { signUserToken } from '../utils/auth/tokenSign.js';
// bcrypt takes care of hashing the user's password
import bcrypt from 'bcryptjs';
// boom allows managing possible errors
import Boom from '@hapi/boom';
// import the configuration module
import { config } from '../config/config.js'

// create the user services class
export class UserServices {

  async login(username, password) {

    try {
      const userRecord = await User.findOne({ where: { username } });

      if (!userRecord) {
        return { status: 'user not found' };
      }

      const validPassword = await bcrypt.compare(password, userRecord.password);

      if (!validPassword) {
        return { status: 'wrong password' };
      }

      await User.update(
        { lastLogin: new Date() },
        { where: { id: userRecord.id } }
      );

      const role = await Role.findOne({ where: { id: userRecord.roleId } });

      const userToken = signUserToken(
        { id: userRecord.id, role: role.name },
        config.authAppJwtKey,
        '1h'
      );

      return { status: 'logged', token: userToken };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to verify user credentials' });
    }
  }

  async createOne(newUser) {

    try {
      const existingUserByUsername = await User.findOne({
        where: { username: newUser.username }
      });

      if (existingUserByUsername) {
        throw Boom.conflict('Username already exists');
      }

      const hash = await hashPassword(newUser.password);

      await User.create({
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        documentTypeId: newUser.documentTypeId,
        documentNumber: newUser.documentNumber,
        municipalityId: newUser.municipalityId,
        roleId: newUser.roleId,
        academicLevelId: newUser.academicLevelId,
        email: newUser.email,
        status: newUser.status,
        password: hash,
        genderId: newUser.genderId,
        lastLogin: newUser.lastLogin ?? new Date(),
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to create new user' });
    }
  }

  async updateOne(userId, newUserData) {

    if (!newUserData) {
      throw Boom.badRequest('No data provided');
    }

    try {
      const existingUser = await User.findOne({ where: { id: userId } });

      if (!existingUser) {
        throw Boom.notFound('User not found');
      }

      const [updatedRows] = await User.update(
        {
          username: newUserData.username,
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
          documentTypeId: newUserData.documentTypeId,
          documentNumber: newUserData.documentNumber,
          municipalityId: newUserData.municipalityId,
          roleId: newUserData.roleId,
          academicLevelId: newUserData.academicLevelId,
          email: newUserData.email,
          status: newUserData.status,
          genderId: newUserData.genderId,
        },
        { where: { id: userId } }
      );

      if (!updatedRows) {
        throw Boom.notFound('User not found');
      }

      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to update user' });
    }
  }

  /**
   * Resets a user's password when they can't log in and don't remember
   * their current password. Since the user isn't authenticated, this
   * does NOT verify the old password (there's nothing to compare
   * against from their side). Instead, it verifies identity using two
   * independent unique fields the user should know — email and document
   * number — before allowing the password to be replaced. No token is
   * issued or verified here: once the password is updated, the user
   * simply logs in again with their new password through the normal
   * login() flow.
   *
   * @param {string} email - The user's registered email.
   * @param {string} documentNumber - The user's registered document number.
   * @param {string} newPassword - The new plain-text password to set.
   * @returns {Promise<{status: string}>}
   */
  async resetPassword(email, documentNumber, newPassword) {

    if (!email || !documentNumber || !newPassword) {
      throw Boom.badRequest('Email, document number, and a new password must all be provided');
    }

    try {
      const existingUser = await User.findOne({
        where: { email, documentNumber }
      });

      if (!existingUser) {
        throw Boom.notFound('No user was found matching the provided email and document number');
      }

      const isSameAsOld = await bcrypt.compare(newPassword, existingUser.password);

      if (isSameAsOld) {
        throw Boom.badRequest('The new password must be different from the previous password');
      }

      const hash = await hashPassword(newPassword);

      await User.update(
        { password: hash },
        { where: { id: existingUser.id } }
      );

      return { status: 'PASSWORD RESET SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to reset the password' });
    }
  }

  async deleteOne(userId) {

    if (!userId) {
      throw Boom.badRequest('No user ID provided');
    }

    try {
      const deletedRows = await User.destroy({ where: { id: userId } });

      if (!deletedRows) {
        throw Boom.notFound('User not found');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to delete user' });
    }
  }

  /**
   * Retrieves a single user by id, embedding its foreign-key catalog
   * records (document type, municipality, role, academic level, gender)
   * as nested { id, name } objects instead of raw FK integers.
   *
   * @param {number} userId - The id of the user to retrieve.
   * @returns {Promise<Object>} - The formatted user record.
   */
  async listOne(userId) {

    if (!userId) {
      throw Boom.badRequest('No user ID provided');
    }

    try {
      const theUser = await User.findOne({
        where: { id: userId },
        include: UserServices.CATALOG_INCLUDES,
      });

      if (!theUser) {
        throw Boom.notFound('User not found');
      }

      return UserServices._formatUser(theUser);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find user' });
    }
  }

  /**
   * Retrieves every user, ordered by id ascending, embedding each
   * user's foreign-key catalog records as nested { id, name } objects.
   *
   * @returns {Promise<Object[]>} - The formatted list of user records.
   */
  async listAll() {

    try {
      const allUsers = await User.findAll({
        order: [['id', 'ASC']],
        include: UserServices.CATALOG_INCLUDES,
      });

      return allUsers.map(UserServices._formatUser);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find users' });
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // ==========================================================

  /**
   * The set of Sequelize includes shared by listOne/listAll to embed
   * each foreign-key catalog record as its full row (id + name), so the
   * response can be reshaped into nested objects rather than bare FK ids.
   *
   * @static
   */
  static CATALOG_INCLUDES = [
    { model: DocumentType, as: 'documentType', attributes: ['id', 'name'] },
    { model: Municipality, as: 'municipality', attributes: ['id', 'name'] },
    { model: Role, as: 'role', attributes: ['id', 'name'] },
    { model: AcademicLevel, as: 'academicLevel', attributes: ['id', 'name'] },
    { model: Gender, as: 'gender', attributes: ['id', 'name'] },
  ];

  /**
   * Reshapes a User Sequelize instance (with its catalog associations
   * eagerly loaded via CATALOG_INCLUDES) into a plain object where the
   * raw FK ids (documentTypeId, municipalityId, roleId, academicLevelId,
   * genderId) are replaced by nested { id, name } objects. Also strips
   * the password hash, since none of these responses should ever leak it.
   *
   * @private
   * @static
   * @param {User} user - The Sequelize User instance to format.
   * @returns {Object} - The formatted, plain user object.
   */
  static _formatUser(user) {
    const {
      password,
      documentTypeId,
      municipalityId,
      roleId,
      academicLevelId,
      genderId,
      documentType,
      municipality,
      role,
      academicLevel,
      gender,
      ...rest
    } = user.toJSON();

    return {
      ...rest,
      documentType: documentType ?? null,
      municipality: municipality ?? null,
      role: role ?? null,
      academicLevel: academicLevel ?? null,
      gender: gender ?? null,
    };
  }
}

// import the user data model
import { User } from '../db/models/usersModel.js';
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
      // Find the user by their username in the database
      const userRecord = await User.findOne({
        where: { username }
      });

      // if not found a user in the database
      if (!userRecord) {
        return { status: 'user not found'};
      }

      // Compare the provided password with the stored password hash
      const validPassword = await bcrypt.compare(password, userRecord.password);

      // If the password is not valid, reject the promise
      if (!validPassword) {
        return { status: 'wrong password'};
      }

      // Generate JWT token with user data
      const userToken = signUserToken(
        { id: userRecord.id },
        config.authAppJwtKey,
        '1h'
      );

      // Resolves the promise with the JWT token
      return { status: 'logged', token: userToken };

    } catch (error) {
      // Return a Boom error if there's an exception
      throw Boom.boomify(error, { message: 'Unable to verify user credentials' });
    }
  }

  async createOne(newUser) {

    try {
      // searches the database if there is a user with this username
      const existingUserByUsername = await User.findOne({
        where: { username: newUser.username }
      });

      // if user exists, reject the user insertion
      if (existingUserByUsername) {
        throw Boom.conflict('Username already exists');
      }

      // hash the user password before it is recorded
      const hash = await hashPassword(newUser.password);

      // create a new record in the database
      await User.create({
        username: newUser.username,
        password: hash,
        email: newUser.email,
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        firstLastName: newUser.firstLastName,
        secondLastName: newUser.secondLastName,
      });

      // return a success response
      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      // Return a Boom error if there's an exception
      throw Boom.boomify(error, { message: 'Unable to create new user' });
    }
  }

  async updateOne(userId, newUserData) {

    if (!newUserData) {
      // return an error response
      throw Boom.badRequest('No data provided');
    }

    try {
      // hash the new user password before saving it in the database
      const hash = await hashPassword(newUserData.password);

      // update the record in the database
      const [updatedRows] = await User.update(
        {
          username: newUserData.username,
          password: hash,
          email: newUserData.email,
          firstName: newUserData.firstName,
          middleName: newUserData.middleName,
          firstLastName: newUserData.firstLastName,
          secondLastName: newUserData.secondLastName,
        },
        {
          where: { id: userId }
        }
      );

      // if no rows were updated, return an error
      if (!updatedRows) {
        throw Boom.notFound('User not found');
      }

      // return a success response
      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      // Return a Boom error if there's an exception
      throw Boom.boomify(error, { message: 'Unable to update user' });
    }
  }

  async deleteOne(userId) {

    if (!userId) {
      // return an error response
      throw Boom.badRequest('No user ID provided');
    }

    try {
      // destroy the record in the database
      const deletedRows = await User.destroy({
        where: { id: userId }
      });

      // if no rows were deleted, return an error
      if (!deletedRows) {
        throw Boom.notFound('User not found');
      }

      // return a success response
      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      // return a Boom error if there's an exception deleting the record
      throw Boom.boomify(error, { message: 'Unable to delete user' });
    }
  }

  async listOne(userId) {

    if (!userId) {
      // return an error response
      throw Boom.badRequest('No user ID provided');
    }

    try {
      const theUser = await User.findOne({
        where: { id: userId }
      });

      if (!theUser) {
        // return an error response
        throw Boom.notFound('User not found');
      }

      delete theUser.dataValues.password;

      return theUser;

    } catch (error) {
      // return a Boom error if there's an exception finding the user
      throw Boom.boomify(error, { message: 'Unable to find user' });
    }
  }

  async listAll() {

    try {
      // save all records in the constant
      let allUsers = await User.findAll({
        order: [['id', 'ASC']]
      });

      // if no records exist
      if (!allUsers.length) {
        allUsers = [];
        return allUsers;
      }

      const theUsers = allUsers.map(user => {
        const userData = user.dataValues;
        delete userData.password;
        return userData;
      });

      return theUsers;

    } catch (error) {
      // return a Boom error if there's an exception finding all users
      throw Boom.boomify(error, { message: 'Unable to find users' });
    }
  }
}

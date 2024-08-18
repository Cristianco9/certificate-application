/*
// import the reader data model
import { Reader } from '../db/models/readerModel.js';
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

// create the reader services class
export class ReaderServices {

  async login(username, password) {
    try {
      // Find the user by their username in the database
      const userRecord = await Reader.findOne({
        where: {
          username: username
        }
      });

      // if not found a user in the database
      if (!userRecord) {
        return { status: "NOT FOUND" };
      }

      // Compare the provided password with the stored password hash
      const validPassword = await bcrypt.compare(password, userRecord.password);

      // If the password is not valid, reject the promise
      if (!validPassword) {
        return { status: "UNAUTHORIZED" };
      }

      // generate an object with the user data
      const userData = { id: userRecord.id };

      // Generate JWT token with user data
      const userToken = signUserToken(
        userData,
        config.authAppJwtKey,
        '8h'
      );

      // Resolves the promise with the JWT token
      return { token: userToken };

    } catch (error) {
      // Return a Boom error if there's an exception
      const boomError = Boom.serverUnavailable(
        'No es posible verificar las credenciales del usuario en la base de datos',
        error
      );
      return boomError;
    }
  }


  async createOne(newUser) {
    try {
      // searches the database if there is a user with this username
      const existingUserByUsername = await Reader.findOne({
        where: { username: newUser.username }
      });

      // if exist a user reject the user insertion
      if (!existingUserByUsername) {
        return { status: "INVALID USERNAME"};
      }

      // hash the user password before to be recorded
      const hash = await hashPassword(newUser.password);

      // create a new record in the data base
      await Reader.create({
        username: newUser.username,
        password: hash
      });

      // return a success response
      return { status: "CREATED SUCCESSFULLY" }

    } catch (error) {
      // Return a Boom error if there's an exception
      const boomError = Boom.serverUnavailable(
        'No es posible crear el nuevo usuario en la base de datos',
        error
      );
      return boomError;
    }
  }

  async updateOne(userId, newUserData) {

    if(!newUserData) {
      // return a error response
      return { status: "NOT DATA SENDED" }
    }

    try {

      // hash the new user password before to saved in the data base
      const hash = await hashPassword(newUserData.password);

      try{
        // update the record in the data base
        await Reader.update({
          username: newUserData.username,
          password: hash
        }, {
          where: {
            id: userId
          }
        });
        // return a success response
        return { status: "UPDATED SUCCESSFULLY"};

      } catch (error) {
        // Return a Boom error if there's an exception
        const boomError = Boom.serverUnavailable(
          'No es posible crear el nuevo usuario en la base de datos',
          error
        );
        return boomError;
      }
    } catch (error) {

        // return a Boom error if there's an exception hashing the new password
        const boomError = Boom.serverUnavailable(
          'No es posible encriptar la contraseña del usuario', error);
        return boomError;
    }
  }

  async deleteOne(userId) {

    // if no send a user ID
    // return a error response
    if(!userId) {
      return { status: "NOT ID SENDED"};
    }

    try {
      // destroy the record in the data base
      await Reader.destroy({
        where: {
          id: userId
        }
      });
      // return a success response
      return { status: "DELETED SUCCESSFULLY"};

    } catch (error) {
        // return a Boom error if there's an exception deleting the record
        const boomError = Boom.serverUnavailable(
          'No es posible eliminar el usuario de la base de datos',
          error);
        return boomError;
    };
  }

  async listOne(userId) {
    // if no send a user ID
    // return a error response
    if(!userId) {
      return { status: "NOT ID SENDED"};
    }

    try {
      const theUser = await Reader.findOne({
        where: { id: userId }
      });

      if (!theUser) {
        // return a error response
        return { status: "NOT FOUNDED"}
      }

      return theUser;

    } catch (error) {
      // return a Boom error if there's an exception finding the user
      const boomError = Boom.serverUnavailable(
        'No es posible encontrar el usuario de la base de datos',
        error);
      return boomError;
    };
  }

  async listAll() {
    try {
      //save all record in the constant
      const allUsers = await Reader.findAll({
        order: [['id', 'ASC']]
      });

      // if not exist records
      if (!allUsers) {
        // return a error response
        return { status: "NOT FOUNDED"}
      }

      return allUsers;

    } catch (error) {
      // return a Boom error if there's an exception finding all users
      const boomError = Boom.serverUnavailable(
        'No es posible encontrar todos los usuarios de la base de datos',
        error);
      return boomError;
    };
  }

}
*/
// import the reader data model
import { Reader } from '../db/models/readerModel.js';
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

// create the reader services class
export class ReaderServices {

  async login(username, password) {
    try {
      // Find the user by their username in the database
      const userRecord = await Reader.findOne({
        where: { username }
      });

      // if not found a user in the database
      if (!userRecord) {
        throw Boom.notFound('User not found');
      }

      // Compare the provided password with the stored password hash
      const validPassword = await bcrypt.compare(password, userRecord.password);

      // If the password is not valid, reject the promise
      if (!validPassword) {
        throw Boom.unauthorized('Invalid password');
      }

      // Generate JWT token with user data
      const userToken = signUserToken(
        { id: userRecord.id },
        config.authAppJwtKey,
        '8h'
      );

      // Resolves the promise with the JWT token
      return { token: userToken };

    } catch (error) {
      // Return a Boom error if there's an exception
      throw Boom.boomify(error, { message: 'Unable to verify user credentials' });
    }
  }

  async createOne(newUser) {
    try {
      // searches the database if there is a user with this username
      const existingUserByUsername = await Reader.findOne({
        where: { username: newUser.username }
      });

      // if user exists, reject the user insertion
      if (existingUserByUsername) {
        throw Boom.conflict('Username already exists');
      }

      // hash the user password before it is recorded
      const hash = await hashPassword(newUser.password);

      // create a new record in the database
      await Reader.create({
        username: newUser.username,
        password: hash
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
      const [updatedRows] = await Reader.update(
        {
          username: newUserData.username,
          password: hash
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
      const deletedRows = await Reader.destroy({
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
      const theUser = await Reader.findOne({
        where: { id: userId }
      });

      if (!theUser) {
        // return an error response
        throw Boom.notFound('User not found');
      }

      delete theUser.password;

      return theUser;

    } catch (error) {
      // return a Boom error if there's an exception finding the user
      throw Boom.boomify(error, { message: 'Unable to find user' });
    }
  }

  async listAll() {
    try {
      // save all records in the constant
      const allUsers = await Reader.findAll({
        order: [['id', 'ASC']]
      });

      // if no records exist
      if (!allUsers.length) {
        // return an error response
        throw Boom.notFound('No users found');
      }

      const theUsers = allUsers.map( user => delete user.password );

      return theUsers;

    } catch (error) {
      // return a Boom error if there's an exception finding all users
      throw Boom.boomify(error, { message: 'Unable to find users' });
    }
  }
}

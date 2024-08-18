// Import the Joi data types library
import Joi from 'joi';

import {
  readerUsername,
  readerPassword
} from '../utils/RegEx/readerRegEx.js';

import { userAuthToken } from '../utils/RegEx/authRegEx.js';

const joiUsername = Joi.string().pattern(readerUsername).messages({
  'string.pattern.base': 'Username must be between 2 and 10 letters only',
});

const joiPassword = Joi.string().pattern(readerPassword).messages({
  'string.pattern.base': 'password must be between 5 and 30 characters',
});

export const readerSchema = Joi.object({

    /*
    authentication: Joi.string().pattern(userAuthToken).message({
      'string.pattern.base': 'token must be between 30 and 150 characters'
    }),
    */

    authentication: Joi.string().pattern(userAuthToken).message({
      'string.pattern.base': 'token must be between 30 and 160 characters'
    }),


    // Validate the username of the reader user
    username: joiUsername,

    // Validate the password of the reader user
    password: joiPassword,

    // Validate the id of the reader user
    id: Joi.number().min(1).max(1000).messages({
      'number.base': 'ID must be a number',
      'number.min': 'ID must be at least 1',
      'number.max': 'ID must be at most 1000',
    }),

    // Validate the object user data
    newUserData: {
      username: joiUsername,
      password: joiPassword,
    }
});

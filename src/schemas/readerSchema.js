// Import the Joi data types library
import Joi from 'joi';

import {
  readerUsername,
  readerPassword,
  readerId
} from '../utils/RegEx/readerRegEx.js';

export const studentSchema = Joi.object({

  // Validate the username of the reader user
  username: Joi.string().pattern(readerUsername).required().messages({
    'string.pattern.base': 'Username must be between 2 and 10 letters only',
    'any.required': 'Username is required'
  }),

    // Validate the password of the reader user
    password: Joi.string().pattern(readerPassword).required().messages({
      'string.pattern.base': 'password must be between 5 and 30 characters',
      'any.required': 'Password is required'
    }),

    // Validate the id of the reader user
    id: Joi.number().min(1).max(1_000).pattern(readerId).messages({
    'string.pattern.base': 'ID must be between 1 and 1000 digits',
  }),
});

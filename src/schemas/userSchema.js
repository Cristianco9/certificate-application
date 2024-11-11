// Import the Joi data types library
import Joi from 'joi';

// Import authentication RegEx from their module
import { userAuthToken } from '../utils/RegEx/authRegEx.js';

// Import user RegEx from their module
import {
  firstName,
  middleName,
  firstLastName,
  secondLastName,
  username,
  password,
  email,
  ID
} from '../utils/RegEx/usersRegEx.js';

// Define global authentication dataType
const joiAuthentication = Joi.string().pattern(userAuthToken).message({
  'string.pattern.base': 'token must be between 30 and 160 characters'
});

// Define global ID dataType
const joiId = Joi.number().min(1).max(1000).messages({
  'number.base': 'ID must be a number',
  'number.min': 'ID must be at least 1',
  'number.max': 'ID must be at most 1000',
});

// Define global username dataType
const joiUsername = Joi.string().pattern(username).messages({
  'string.pattern.base': 'username must be between 2 and 20 letters only',
});

// Define global password dataType
const joiPassword = Joi.string().pattern(password).messages({
  'string.pattern.base': 'password must be between 5 and 30 characters',
});

// Validate the email of the user
// Define global email dataType
const JoiEmail = Joi.string().pattern(email).message({
  'string.pattern.base': 'email contains characters must be followed by *@domain.*'
});

// Validate the first name of the user
// Define global first name dataType
const joiFirstName = Joi.string().pattern(firstName).message({
  'string.pattern.base': 'firstName contains only letters between 3 to 20 characters'
});

// Validate the middle name of the user
// Define global middle name dataType
const joiMiddleName = Joi.string().pattern(middleName).message({
  'string.pattern.base': 'middleName contains only letters between 3 to 20 characters'
});

// Validate the first last name of the user
// Define global first last name dataType
const joiFirstLastName = Joi.string().pattern(firstLastName).message({
  'string.pattern.base': 'firstLastName contains only letters between 3 to 20 characters'
});

// Validate the second last name of the user
// Define global second last name dataType
const joiSecondLastName = Joi.string().pattern(secondLastName).message({
  'string.pattern.base': 'secondLastName contains only letters between 3 to 20 characters'
});


// Define and export user dataType schema
export const userSchema = Joi.object({

    // Validate the JWT token of the user
    authentication: joiAuthentication,
    // Validate the user id
    id: joiId,
    // Validate the user credentials
    credentials: {
      username: joiUsername,
      password: joiPassword
    },
    // Validate the object new user data
    newUserData: {
      username: joiUsername,
      password: joiPassword,
      email: JoiEmail,
      firstName: joiFirstName,
      middleName: joiMiddleName,
      firstLastName: joiFirstLastName,
      secondLastName: joiSecondLastName
    }
});

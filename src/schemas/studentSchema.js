// Import the Joi data types library
import Joi from 'joi';
// Import the student Regular Expressions from their module
import {
  studentFirstLastName,
  studentFirstName,
  studentID,
  studentSecondLastName,
  studentSecondName
} from '../utils/RegEx/studentRegEx';

// Define the Joi validation schema for a student object
export const studentSchema = Joi.object({

  // Validate the first name of the student
  // The pattern ensures the first name contains only letters
  // (both uppercase and lowercase)
  // and is between 2 to 10 characters long
  firstName: Joi.string().pattern(studentFirstName).required().messages({
    'string.pattern.base': 'First name must be between 2 and 10 letters only',
    'any.required': 'First name is required'
  }),

  // Validate the second name of the student
  // The pattern ensures the second name contains only letters (both uppercase and lowercase)
  // and is between 2 to 10 characters long
  secondName: Joi.string().pattern(studentSecondName).required().messages({
    'string.pattern.base': 'Second name must be between 2 and 10 letters only',
    'any.required': 'Second name is required'
  }),

  // Validate the first last name of the student
  // The pattern ensures the first last name contains only letters (both uppercase and lowercase)
  // and is between 2 to 10 characters long
  firstLastName: Joi.string().pattern(studentFirstLastName).required().messages({
    'string.pattern.base': 'First last name must be between 2 and 10 letters only',
    'any.required': 'First last name is required'
  }),

  // Validate the second last name of the student
  // The pattern ensures the second last name contains only letters (both uppercase and lowercase)
  // and is between 2 to 10 characters long
  secondLastName: Joi.string().pattern(studentSecondLastName).required().messages({
    'string.pattern.base': 'Second last name must be between 2 and 10 letters only',
    'any.required': 'Second last name is required'
  }),

  // Validate the student ID
  // The pattern ensures the student ID contains exactly 10 digits
  studentID: Joi.string().pattern(studentID).required().messages({
    'string.pattern.base': 'Student ID must be exactly 10 digits',
    'any.required': 'Student ID is required'
  })
});

export default studentSchema;

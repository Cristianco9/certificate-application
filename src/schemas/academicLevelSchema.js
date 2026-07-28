// Joi is used across the project for request validation (see AGENTS.md section 9)
import Joi from 'joi';

// ==========================================================
// FIELD-LEVEL CONSTANTS
// Mirrors the closed ENUM sets defined in the Sequelize model
// (models/academicLevel.js) and the migration
// (migrations/20260707173556-academicLevel.cjs). Kept here, not
// imported from the service layer, so this schema has no dependency
// on AcademicLevelServices — validation must be able to run before
// any service code executes.
// ==========================================================

// Allowed values for 'nombre_nivel_academico'
const ACADEMIC_LEVEL_NAME_VALUES = [
  'Técnico',
  'tecnólogo',
  'Licenciado',
  'Especialista',
  'Maestría',
  'Doctorado',
  'Post-Doctorado',
];

// Allowed values for 'abreviatura_nivel_academico'
const ACADEMIC_LEVEL_ABBREVIATION_VALUES = ['Téc', 'Tgo', 'Lic', 'Esp', 'Mgs', 'Ph.D'];

// ==========================================================
// SHARED SUB-SHAPES
// Not exported directly; reused by the id-based schemas below to
// avoid repeating the same validation rule twice.
// ==========================================================

// Validates the numeric primary key ('id_nivel_academico')
const academicLevelId = Joi.number().integer().positive().required().messages({
  'number.base': 'The academic level id must be a number',
  'number.integer': 'The academic level id must be an integer',
  'number.positive': 'The academic level id must be a positive number',
  'any.required': 'The academic level id is required',
});

// Validates 'name' ('nombre_nivel_academico')
const academicLevelName = Joi.string()
  .valid(...ACADEMIC_LEVEL_NAME_VALUES)
  .messages({
    'string.base': 'The academic level name must be a string',
    'any.only': `The academic level name must be one of: ${ACADEMIC_LEVEL_NAME_VALUES.join(', ')}`,
    'any.required': 'The academic level name is required',
  });

// Validates 'abbreviation' ('abreviatura_nivel_academico')
const academicLevelAbbreviation = Joi.string()
  .valid(...ACADEMIC_LEVEL_ABBREVIATION_VALUES)
  .messages({
    'string.base': 'The academic level abbreviation must be a string',
    'any.only': `The academic level abbreviation must be one of: ${ACADEMIC_LEVEL_ABBREVIATION_VALUES.join(', ')}`,
    'any.required': 'The academic level abbreviation is required',
  });


/**
 * Validates the request body when creating a new academic level.
 * Both 'name' and 'abbreviation' are required, matching the
 * allowNull: false constraint on both columns in the migration.
 */
export const createAcademicLevelSchema = Joi.object({
  name: academicLevelName.required(),
  abbreviation: academicLevelAbbreviation.required(),
});

/**
 * Validates the request body when partially updating an existing
 * academic level. Every field is optional, but at least one must be
 * present so the request carries something to update.
 */
export const updateAcademicLevelSchema = Joi.object({
  name: academicLevelName,
  abbreviation: academicLevelAbbreviation,
}).min(1).messages({
  'object.min': 'At least one field (name or abbreviation) must be provided to update the academic level',
});

/**
 * Validates the identifier of the academic level to retrieve
 * (typically sourced from req.params).
 */
export const getAcademicLevelSchema = Joi.object({
  id: academicLevelId,
});

/**
 * Validates the identifier of the academic level to delete
 * (typically sourced from req.params).
 */
export const deleteAcademicLevelSchema = Joi.object({
  id: academicLevelId,
});

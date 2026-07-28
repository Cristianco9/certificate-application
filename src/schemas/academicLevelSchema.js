// Joi is used across the project for request validation (see AGENTS.md section 9)
import Joi from 'joi';
// Regex patterns are always imported from utils/RegEx/<domain>RegEx.js,
// never written inline in the schema (see AGENTS.md section 2)
import {
  academicLevelName as academicLevelNameRegEx,
  academicLevelAbbreviation as academicLevelAbbreviationRegEx,
  academicLevelId as academicLevelIdRegEx,
} from '../utils/RegEx/academicLevelRegEx.js';

// ==========================================================
// SHARED SUB-SHAPES
// Not exported directly; reused by the schemas below to avoid
// repeating the same validation rule twice.
// ==========================================================

// Validates the primary key ('id_nivel_academico'). Kept as a string
// pattern (rather than Joi.number()) to match academicLevelIdRegEx,
// since route params always arrive as strings.
const academicLevelId = Joi.string()
  .pattern(academicLevelIdRegEx)
  .messages({
    'string.base': 'The academic level id must be a string of digits',
    'string.pattern.base': 'The academic level id must contain only digits (1 to 10 digits long)',
    'any.required': 'The academic level id is required',
  });

// Validates 'name' ('nombre_nivel_academico'): letters, spaces, 3 to
// 50 characters long
const academicLevelName = Joi.string()
  .pattern(academicLevelNameRegEx)
  .messages({
    'string.base': 'The academic level name must be a string',
    'string.pattern.base': 'The academic level name must be 3 to 50 characters long and contain only letters and spaces',
    'any.required': 'The academic level name is required',
  });

// Validates 'abbreviation' ('abreviatura_nivel_academico') against the
// closed set of academic level abbreviations: Téc, Tgo, Lic, Esp, Mgs, Ph.D
const academicLevelAbbreviation = Joi.string()
  .pattern(academicLevelAbbreviationRegEx)
  .messages({
    'string.base': 'The academic level abbreviation must be a string',
    'string.pattern.base': 'The academic level abbreviation must be one of: Téc, Tgo, Lic, Esp, Mgs, Ph.D',
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
  id: academicLevelId.required(),
});

/**
 * Validates the identifier of the academic level to delete
 * (typically sourced from req.params).
 */
export const deleteAcademicLevelSchema = Joi.object({
  id: academicLevelId.required(),
});

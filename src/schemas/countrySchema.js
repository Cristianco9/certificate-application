// Joi is used across the project for request validation (see AGENTS.md section 9)
import Joi from 'joi';
// Regex patterns are always imported from utils/RegEx/<domain>RegEx.js,
// never written inline in the schema (see AGENTS.md section 2)
import { countryNameRegEx, countryIso2CodeRegEx } from '../utils/RegEx/countryRegEx.js';

// ==========================================================
// SHARED SUB-SHAPES
// Not exported directly; reused by the schemas below to avoid
// repeating the same validation rule twice.
// ==========================================================

// Validates the numeric primary key ('id_pais')
const countryId = Joi.number().integer().positive().required().messages({
  'number.base': 'The country id must be a number',
  'number.integer': 'The country id must be an integer',
  'number.positive': 'The country id must be a positive number',
  'any.required': 'The country id is required',
});

// Validates 'name' ('nombre_pais'), STRING(50), letters and single
// spaces only
const countryName = Joi.string()
  .max(50)
  .pattern(countryNameRegEx)
  .messages({
    'string.base': 'The country name must be a string',
    'string.max': 'The country name must be at most 50 characters long',
    'string.pattern.base': 'The country name may only contain letters and single spaces between words',
    'any.required': 'The country name is required',
  });

// Validates 'iso2Code' ('codigo_iso2'), STRING(2), two letters
const countryIso2Code = Joi.string()
  .length(2)
  .pattern(countryIso2CodeRegEx)
  .messages({
    'string.base': 'The ISO code must be a string',
    'string.length': 'The ISO code must be exactly 2 characters long',
    'string.pattern.base': 'The ISO code must contain only letters (e.g. \'CO\')',
  });

// ==========================================================
// EXPORTED SCHEMAS
// ==========================================================

/**
 * Validates the request body when creating a new country. 'name' is
 * required, matching allowNull: false in the migration; 'iso2Code' is
 * optional, matching allowNull: true.
 */
export const createCountrySchema = Joi.object({
  name: countryName.required(),
  iso2Code: countryIso2Code,
});

/**
 * Validates the request body when partially updating an existing
 * country. Every field is optional, but at least one must be present
 * so the request carries something to update.
 */
export const updateCountrySchema = Joi.object({
  name: countryName,
  iso2Code: countryIso2Code,
}).min(1).messages({
  'object.min': 'At least one field (name or iso2Code) must be provided to update the country',
});

/**
 * Validates the identifier of the country to retrieve (typically
 * sourced from req.params).
 */
export const getCountrySchema = Joi.object({
  id: countryId,
});

/**
 * Validates the identifier of the country to delete (typically
 * sourced from req.params).
 */
export const deleteCountrySchema = Joi.object({
  id: countryId,
});

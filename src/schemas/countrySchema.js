// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY SCHEMA — Joi Validation
// Entity: Country | Table: pais
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of CountryServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByPartialName, listByIso2Code) are still
// validated as a small object with one named key, since Joi always
// validates an object shape.

import Joi from 'joi';

import { countryId, countryName, countryIso2Code } from '../utils/RegEx/countryRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Country.id ('id_pais'). Kept as a string pattern, not
// Joi.number(), since countryId is a digit-string RegEx.
const joiId = Joi.string().pattern(countryId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Country.name ('nombre_pais')
const joiName = Joi.string().pattern(countryName).messages({
  'string.base': 'El nombre del país debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del país debe tener entre 3 y 50 caracteres y contener solo letras y espacios.',
});

// Backs Country.iso2Code ('codigo_iso2'). Nullable at the database
// level, so it is never marked .required() by default — each schema
// below opts in to requiring it only where the business flow demands it.
const joiIso2Code = Joi.string().pattern(countryIso2Code).messages({
  'string.base': 'El código ISO debe ser una cadena de texto.',
  'string.pattern.base': 'El código ISO debe tener exactamente 2 letras (por ejemplo, \'CO\').',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const countrySchema = {

  // POST /countries/get-by-id (body: { id })
  // Validates CountryServices.listOne(countryId)
  getCountryById: Joi.object({
    id: joiId.required(),
  }),

  // GET /countries/list ()
  // Validates CountryServices.listAll() — no input parameters, so no
  // schema is applied to this endpoint.

  // POST /countries/search-by-name (body: { partialName })
  // Validates CountryServices.listByPartialName(partialName). Reuses
  // the same character-set rule as 'name' (letters and spaces only),
  // since a search box should not accept digits or symbols either.
  searchCountriesByName: Joi.object({
    partialName: joiName.required(),
  }),

  // POST /countries/get-by-iso2-code (body: { iso2Code })
  // Validates CountryServices.listByIso2Code(iso2Code)
  getCountryByIso2Code: Joi.object({
    iso2Code: joiIso2Code.required(),
  }),

  // POST /countries (body: { name, iso2Code? })
  // Validates CountryServices.createOne(newCountry). 'name' is
  // required, matching allowNull: false; 'iso2Code' is optional,
  // matching allowNull: true on the column.
  newCountryData: Joi.object({
    name: joiName.required(),
    iso2Code: joiIso2Code,
  }),

  // PATCH /countries (body: { id, name?, iso2Code? })
  // Validates BOTH arguments of CountryServices.updateOne(countryId,
  // newCountryData) in a single object, since the frontend sends the id
  // inside the body rather than as a route param. 'id' is always
  // required; at least one of 'name'/'iso2Code' must also be present so
  // the request carries something to update.
  updateCountryData: Joi.object({
    id: joiId.required(),
    name: joiName,
    iso2Code: joiIso2Code,
  }).or('name', 'iso2Code').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos name o iso2Code para actualizar el país.',
  }),

  // DELETE /countries (body: { id })
  // Validates CountryServices.deleteOne(countryId)
  deleteCountry: Joi.object({
    id: joiId.required(),
  }),

};

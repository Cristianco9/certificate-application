// ─────────────────────────────────────────────────────────────────────────────
// MUNICIPALITY SCHEMA — Joi Validation
// Entity: Municipality | Table: municipio
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of MunicipalityServices. The frontend
// sends every value through the request body — never via URL params or
// query string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByPartialName, listByDepartment) are still
// validated as a small object with one named key, since Joi always
// validates an object shape.

import Joi from 'joi';

import {
  municipalityId,
  municipalityName,
  municipalityDepartmentId,
} from '../utils/RegEx/municipalityRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Municipality.id ('id_municipio'). Kept as a string pattern, not
// Joi.number(), since municipalityId is a digit-string RegEx.
const joiId = Joi.string().pattern(municipalityId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Municipality.name ('nombre_municipio')
const joiName = Joi.string().pattern(municipalityName).messages({
  'string.base': 'El nombre del municipio debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del municipio debe tener entre 3 y 50 caracteres y contener solo letras y espacios.',
});

// Backs Municipality.departmentId ('id_departamento'), the foreign key
// to Department. Kept as a string pattern for the same reason as joiId.
const joiDepartmentId = Joi.string().pattern(municipalityDepartmentId).messages({
  'string.base': 'El id del departamento debe ser una cadena de texto.',
  'string.pattern.base': 'El id del departamento debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const municipalitySchema = {

  // POST /municipalities/get-by-id (body: { id })
  // Validates MunicipalityServices.listOne(municipalityId)
  getMunicipalityById: Joi.object({
    id: joiId.required(),
  }),

  // GET /municipalities/list ()
  // Validates MunicipalityServices.listAll() — no input parameters, so
  // no schema is applied to this endpoint.

  // POST /municipalities/search-by-name (body: { partialName })
  // Validates MunicipalityServices.listByPartialName(partialName).
  // 'name' is free text (no ENUM), so a partial search is meaningful
  // here — same reasoning as Country/Department. Reuses the 'name'
  // character-set rule (letters and spaces only).
  searchMunicipalitiesByName: Joi.object({
    partialName: joiName.required(),
  }),

  // POST /municipalities/get-by-department (body: { departmentId })
  // Validates MunicipalityServices.listByDepartment(departmentId).
  // Supports the cascading select flow (country -> department ->
  // municipality).
  listMunicipalitiesByDepartment: Joi.object({
    departmentId: joiDepartmentId.required(),
  }),

  // POST /municipalities (body: { name, departmentId })
  // Validates MunicipalityServices.createOne(newMunicipality). Both
  // fields are required, matching allowNull: false on both columns.
  newMunicipalityData: Joi.object({
    name: joiName.required(),
    departmentId: joiDepartmentId.required(),
  }),

  // PATCH /municipalities (body: { id, name?, departmentId? })
  // Validates BOTH arguments of MunicipalityServices.updateOne
  // (municipalityId, newMunicipalityData) in a single object, since the
  // frontend sends the id inside the body rather than as a route param.
  // 'id' is always required; at least one of 'name'/'departmentId' must
  // also be present so the request carries something to update.
  updateMunicipalityData: Joi.object({
    id: joiId.required(),
    name: joiName,
    departmentId: joiDepartmentId,
  }).or('name', 'departmentId').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos name o departmentId para actualizar el municipio.',
  }),

  // DELETE /municipalities (body: { id })
  // Validates MunicipalityServices.deleteOne(municipalityId)
  deleteMunicipality: Joi.object({
    id: joiId.required(),
  }),

};

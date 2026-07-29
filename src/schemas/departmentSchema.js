// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT SCHEMA — Joi Validation
// Entity: Department | Table: departamento
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of DepartmentServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByPartialName, listByCountry) are still
// validated as a small object with one named key, since Joi always
// validates an object shape.

import Joi from 'joi';

import {
  departmentId,
  departmentName,
  departmentCountryId,
} from '../utils/RegEx/departmentRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Department.id ('id_departamento'). Kept as a string pattern,
// not Joi.number(), since departmentId is a digit-string RegEx.
const joiId = Joi.string().pattern(departmentId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Department.name ('nombre_departamento')
const joiName = Joi.string().pattern(departmentName).messages({
  'string.base': 'El nombre del departamento debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del departamento debe tener entre 3 y 50 caracteres y contener solo letras y espacios.',
});

// Backs Department.countryId ('id_pais'), the foreign key to Country.
// Kept as a string pattern for the same reason as joiId above.
const joiCountryId = Joi.string().pattern(departmentCountryId).messages({
  'string.base': 'El id del país debe ser una cadena de texto.',
  'string.pattern.base': 'El id del país debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const departmentSchema = {

  // POST /departments/get-by-id (body: { id })
  // Validates DepartmentServices.listOne(departmentId)
  getDepartmentById: Joi.object({
    id: joiId.required(),
  }),

  // GET /departments/list ()
  // Validates DepartmentServices.listAll() — no input parameters, so no
  // schema is applied to this endpoint.

  // POST /departments/search-by-name (body: { partialName })
  // Validates DepartmentServices.listByPartialName(partialName). Reuses
  // the same character-set rule as 'name' (letters and spaces only),
  // since a search box should not accept digits or symbols either.
  searchDepartmentsByName: Joi.object({
    partialName: joiName.required(),
  }),

  // POST /departments/get-by-country (body: { countryId })
  // Validates DepartmentServices.listByCountry(countryId). Supports the
  // cascading select flow (country -> department -> municipality).
  listDepartmentsByCountry: Joi.object({
    countryId: joiCountryId.required(),
  }),

  // POST /departments (body: { name, countryId })
  // Validates DepartmentServices.createOne(newDepartment). Both fields
  // are required, matching allowNull: false on both columns.
  newDepartmentData: Joi.object({
    name: joiName.required(),
    countryId: joiCountryId.required(),
  }),

  // PATCH /departments (body: { id, name?, countryId? })
  // Validates BOTH arguments of DepartmentServices.updateOne
  // (departmentId, newDepartmentData) in a single object, since the
  // frontend sends the id inside the body rather than as a route param.
  // 'id' is always required; at least one of 'name'/'countryId' must
  // also be present so the request carries something to update.
  updateDepartmentData: Joi.object({
    id: joiId.required(),
    name: joiName,
    countryId: joiCountryId,
  }).or('name', 'countryId').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos name o countryId para actualizar el departamento.',
  }),

  // DELETE /departments (body: { id })
  // Validates DepartmentServices.deleteOne(departmentId)
  deleteDepartment: Joi.object({
    id: joiId.required(),
  }),

};

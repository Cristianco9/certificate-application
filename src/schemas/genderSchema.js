// ─────────────────────────────────────────────────────────────────────────────
// GENDER SCHEMA — Joi Validation
// Entity: Gender | Table: genero
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of GenderServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByName) are still validated as a small object
// with one named key, since Joi always validates an object shape.

import Joi from 'joi';

import { genderId, genderName } from '../utils/RegEx/genderRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Gender.id ('id_genero'). Kept as a string pattern, not
// Joi.number(), since genderId is a digit-string RegEx.
const joiId = Joi.string().pattern(genderId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Gender.name ('nombre_genero'). Length (3 to 20 characters,
// matching VARCHAR(20)) is enforced here via .min()/.max(), separately
// from the word-shape pattern in genderRegEx.js.
const joiName = Joi.string().min(3).max(20).pattern(genderName).messages({
  'string.base': 'El nombre del género debe ser una cadena de texto.',
  'string.min': 'El nombre del género debe tener al menos 3 caracteres.',
  'string.max': 'El nombre del género debe tener máximo 20 caracteres.',
  'string.pattern.base': 'El nombre del género debe contener solo letras y espacios simples entre palabras.',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const genderSchema = {

  // POST /genders/get-by-id (body: { id })
  // Validates GenderServices.listOne(genderId)
  getGenderById: Joi.object({
    id: joiId.required(),
  }),

  // GET /genders/list ()
  // Validates GenderServices.listAll() — no input parameters, so no
  // schema is applied to this endpoint.

  // POST /genders/get-by-name (body: { name })
  // Validates GenderServices.listByName(name)
  getGenderByName: Joi.object({
    name: joiName.required(),
  }),

  // POST /genders (body: { name })
  // Validates GenderServices.createOne(newGender). 'name' is required,
  // matching allowNull: false on the column.
  newGenderData: Joi.object({
    name: joiName.required(),
  }),

  // PATCH /genders (body: { id, name })
  // Validates BOTH arguments of GenderServices.updateOne(genderId,
  // newGenderData) in a single object, since the frontend sends the id
  // inside the body rather than as a route param. 'name' is required
  // here (rather than optional) because it is the entity's only
  // mutable field — with a single updatable column, there is no
  // meaningful partial update short of providing it.
  updateGenderData: Joi.object({
    id: joiId.required(),
    name: joiName.required(),
  }),

  // DELETE /genders (body: { id })
  // Validates GenderServices.deleteOne(genderId)
  deleteGender: Joi.object({
    id: joiId.required(),
  }),

};

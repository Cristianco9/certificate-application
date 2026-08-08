// ─────────────────────────────────────────────────────────────────────────────
// GRADE SCHEMA — Joi Validation
// Entity: Grade | Table: grado
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of GradeServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByName) are still validated as a small object
// with one named key, since Joi always validates an object shape.
// 'name' is backed by a fixed MySQL ENUM, so only exact lookup exists;
// there is no partial search for name. 'description' is free text, so a
// partial search endpoint is provided for it.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  gradeId,
  gradeName,
  gradeDescription,
} from '../utils/RegEx/gradeRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Grade.id ('id_grado'). Kept as a string pattern, not Joi.number(),
// since gradeId is a digit-string RegEx.
const joiId = Joi.string().pattern(gradeId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Grade.name ('nombre_grado'), a closed set of 11 curricular grades.
const joiName = Joi.string().pattern(gradeName).messages({
  'string.base': 'El nombre del grado debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del grado debe ser uno de: Primero, Segundo, Tercero, Cuarto, Quinto, Sexto, Séptimo, Octavo, Noveno, Décimo, Undécimo.',
});

// Backs Grade.description ('descripcion_grado'), free text.
const joiDescription = Joi.string().pattern(gradeDescription).messages({
  'string.base': 'La descripción del grado debe ser una cadena de texto.',
  'string.pattern.base': 'La descripción del grado debe tener entre 3 y 50 caracteres y contener solo letras, números, espacios y los signos . , -',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const gradeSchema = {

  // POST /grades/get-by-id (body: { id })
  // Validates GradeServices.listOne(gradeId)
  getGradeById: Joi.object({
    id: joiId.required(),
  }),

  // GET /grades/list-all → no input parameters, no schema applied.

  // POST /grades/get-by-name (body: { name })
  // Validates GradeServices.listByName(name). Exact lookup only (ENUM).
  getGradeByName: Joi.object({
    name: joiName.required(),
  }),

  // POST /grades/search-by-description (body: { partialDescription })
  // Validates GradeServices.listByPartialDescription(partialDescription)
  searchGradesByDescription: Joi.object({
    partialDescription: joiDescription.required(),
  }),

  // POST /grades (body: { name, description })
  // Validates GradeServices.createOne(newGrade). Both fields required.
  newGradeData: Joi.object({
    name: joiName.required(),
    description: joiDescription.required(),
  }),

  // PATCH /grades (body: { id, name?, description? })
  // Validates GradeServices.updateOne(gradeId, newGradeData)
  // 'id' is always required; at least one of 'name' or 'description'
  // must be present for the update to be meaningful.
  updateGradeData: Joi.object({
    id: joiId.required(),
    name: joiName,
    description: joiDescription,
  }).or('name', 'description').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos name o description para actualizar el grado.',
  }),

  // DELETE /grades (body: { id })
  // Validates GradeServices.deleteOne(gradeId)
  deleteGrade: Joi.object({
    id: joiId.required(),
  }),

};

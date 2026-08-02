// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC LEVEL SCHEMA — Joi Validation
// Entity: AcademicLevel | Table: nivel_academico
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of AcademicLevelServices. The frontend
// sends every value through the request body — it never places anything in
// the URL (no route params, no query string) — so every schema below is
// meant to be applied as validatorHandler(schema, 'body'), including the
// ones that only carry an id. Methods that take a single primitive argument
// on the service side (listOne, deleteOne, listByName, listByAbbreviation)
// are still validated as a small object with one named key, since Joi
// always validates an object shape; that object is simply read from
// req.body instead of req.params. updateOne needs both the id and the
// partial payload, so its schema combines them into a single body object
// rather than being split into a params/body pair.

import Joi from 'joi';

import {
  academicLevelId,
  academicLevelName,
  academicLevelAbbreviation,
} from '../utils/RegEx/academicLevelRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs AcademicLevel.id ('id_nivel_academico'). Kept as a string pattern,
// not Joi.number(), since academicLevelId is a digit-string RegEx.
const joiId = Joi.string().pattern(academicLevelId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs AcademicLevel.name ('nombre_nivel_academico')
const joiName = Joi.string().pattern(academicLevelName).messages({
  'string.base': 'El nombre del nivel académico debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del nivel académico debe tener entre 3 y 50 caracteres y contener solo letras y espacios.',
});

// Backs AcademicLevel.abbreviation ('abreviatura_nivel_academico')
const joiAbbreviation = Joi.string().pattern(academicLevelAbbreviation).messages({
  'string.base': 'La abreviatura del nivel académico debe ser una cadena de texto.',
  'string.pattern.base': 'La abreviatura del nivel académico debe ser una de: Téc, Tgo, Lic, Esp, Mgs, Ph.D .',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const academicLevelSchema = {

  // POST /academic-levels/get-by-id (body: { id })
  // Validates AcademicLevelServices.listOne(academicLevelId)
  getAcademicLevelById: Joi.object({
    id: joiId.required(),
  }),

  // GET /academic-levels/list ()
  // Validates AcademicLevelServices.listAll() — no input parameters,
  // so no schema is applied to this endpoint.

  // POST /academic-levels/get-by-name (body: { name })
  // Validates AcademicLevelServices.listByName(name)
  getAcademicLevelByName: Joi.object({
    name: joiName.required(),
  }),

  // POST /academic-levels/get-by-abbreviation (body: { abbreviation })
  // Validates AcademicLevelServices.listByAbbreviation(abbreviation)
  getAcademicLevelByAbbreviation: Joi.object({
    abbreviation: joiAbbreviation.required(),
  }),

  // POST /academic-levels (body: { name, abbreviation })
  // Validates AcademicLevelServices.createOne(newAcademicLevel).
  // Both fields are required, matching allowNull: false on both columns.
  newAcademicLevelData: Joi.object({
    name: joiName.required(),
    abbreviation: joiAbbreviation.required(),
  }),

  // PATCH /academic-levels (body: { id, name?, abbreviation? })
  // Validates BOTH arguments of AcademicLevelServices.updateOne
  // (academicLevelId, newAcademicLevelData) in a single object, since the
  // frontend sends the id inside the body rather than as a route param.
  // 'id' is always required; at least one of 'name'/'abbreviation' must
  // also be present so the request carries something to update.
  updateAcademicLevelData: Joi.object({
    id: joiId.required(),
    name: joiName.optional(),
    abbreviation: joiAbbreviation.optional(),
  }).or('name', 'abbreviation').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos name o abbreviation para actualizar el nivel académico.',
  }),

  // DELETE /academic-levels (body: { id })
  // Validates AcademicLevelServices.deleteOne(academicLevelId)
  deleteAcademicLevel: Joi.object({
    id: joiId.required(),
  }),

};

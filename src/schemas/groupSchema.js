// ─────────────────────────────────────────────────────────────────────────────
// GROUP SCHEMA — Joi Validation
// Entity: Group | Table: grupo
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of GroupServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByPartialName, listByInstitution,
// listByGradeAndYear) are still validated as a small object with one
// (or more) named keys, since Joi always validates an object shape.
// 'shift' and 'status' are backed by fixed MySQL ENUM columns, so they
// are validated with Joi.valid() rather than a RegEx pattern.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  groupId,
  groupName,
  groupYear,
  groupGradeId,
  groupInstitutionId,
} from '../utils/RegEx/groupRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Group.id ('id_grupo'). Kept as a string pattern, not Joi.number(),
// since groupId is a digit-string RegEx.
const joiId = Joi.string().pattern(groupId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Group.name ('nombre_grupo'). Allows letters, digits and hyphens.
const joiName = Joi.string().pattern(groupName).messages({
  'string.base': 'El nombre del grupo debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del grupo debe tener entre 1 y 50 caracteres y contener solo letras, números y guiones.',
});

// Backs Group.year ('anio_grupo'). A 4-digit year between 1900-2099.
const joiYear = Joi.string().pattern(groupYear).messages({
  'string.base': 'El año debe ser una cadena de texto.',
  'string.pattern.base': 'El año debe ser un número de 4 dígitos entre 1900 y 2099.',
});

// Backs Group.gradeId ('id_grado_grupo'). Nullable at the database level,
// so it is never marked .required() by default.
const joiGradeId = Joi.string().pattern(groupGradeId).messages({
  'string.base': 'El id del grado debe ser una cadena de texto.',
  'string.pattern.base': 'El id del grado debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Group.institutionId ('id_institucion'). Nullable at the database level.
const joiInstitutionId = Joi.string().pattern(groupInstitutionId).messages({
  'string.base': 'El id de la institución debe ser una cadena de texto.',
  'string.pattern.base': 'El id de la institución debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Group.shift ('jornada'). ENUM('DIURNA','NOCTURNA').
const joiShift = Joi.string().valid('DIURNA', 'NOCTURNA').messages({
  'string.base': 'La jornada debe ser una cadena de texto.',
  'any.only': 'La jornada debe ser "DIURNA" o "NOCTURNA".',
});

// Backs Group.status ('estado_grupo'). ENUM('ACTIVO','INACTIVO').
const joiStatus = Joi.string().valid('ACTIVO', 'INACTIVO').messages({
  'string.base': 'El estado debe ser una cadena de texto.',
  'any.only': 'El estado debe ser "ACTIVO" o "INACTIVO".',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const groupSchema = {

  // POST /groups/get-by-id (body: { id })
  // Validates GroupServices.listOne(groupId)
  getGroupById: Joi.object({
    id: joiId.required(),
  }),

  // GET /groups/list-all → no input parameters, no schema applied.

  // POST /groups/search-by-name (body: { partialName })
  // Validates GroupServices.listByPartialName(partialName).
  // Reuses the same character-set rule as 'name' (letters, digits, hyphens).
  searchGroupsByName: Joi.object({
    partialName: joiName.required(),
  }),

  // POST /groups/get-by-institution (body: { institutionId })
  // Validates GroupServices.listByInstitution(institutionId)
  listGroupsByInstitution: Joi.object({
    institutionId: joiInstitutionId.required(),
  }),

  // POST /groups/get-by-grade-and-year (body: { gradeId, year })
  // Validates GroupServices.listByGradeAndYear(gradeId, year)
  listGroupsByGradeAndYear: Joi.object({
    gradeId: joiGradeId.required(),
    year: joiYear.required(),
  }),

  // POST /groups (body: { name, year, gradeId?, shift, institutionId?, status })
  // Validates GroupServices.createOne(newGroup)
  // Both 'name' and 'year' and 'shift' and 'status' are required (allowNull: false
  // in the database). 'gradeId' and 'institutionId' are optional (allowNull: true).
  newGroupData: Joi.object({
    name: joiName.required(),
    year: joiYear.required(),
    gradeId: joiGradeId,
    shift: joiShift.required(),
    institutionId: joiInstitutionId,
    status: joiStatus.required(),
  }),

  // PATCH /groups (body: { id, name?, year?, gradeId?, shift?, institutionId?, status? })
  // Validates BOTH arguments of GroupServices.updateOne(groupId, newGroupData)
  // 'id' is always required; at least one mutable field must be present.
  updateGroupData: Joi.object({
    id: joiId.required(),
    name: joiName,
    year: joiYear,
    gradeId: joiGradeId,
    shift: joiShift,
    institutionId: joiInstitutionId,
    status: joiStatus,
  }).or('name', 'year', 'gradeId', 'shift', 'institutionId', 'status').messages({
    'object.missing': 'Debe proporcionar al menos un campo para actualizar el grupo.',
  }),

  // PATCH /groups/change-status (body: { id, status })
  // Validates GroupServices.changeStatus(groupId, newStatus)
  changeGroupStatus: Joi.object({
    id: joiId.required(),
    status: joiStatus.required(),
  }),

  // DELETE /groups (body: { id })
  // Validates GroupServices.deleteOne(groupId)
  deleteGroup: Joi.object({
    id: joiId.required(),
  }),

};

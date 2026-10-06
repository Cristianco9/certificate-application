// ─────────────────────────────────────────────────────────────────────────────
// STUDENT PHONE SCHEMA — Joi Validation
// Entity: StudentPhone | Table: estudiante_telefono
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of StudentPhoneServices. The frontend
// sends every value through the request body — never via URL params or
// query string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take one or more primitive arguments on the service
// side (listOne, deleteOne, listByStudent, listByPhone,
// getByStudentAndPhone, unlinkByStudentAndPhone) are still validated as a
// small object with one (or more) named keys, since Joi always validates
// an object shape.
//
// No 'update' schema exists: studentId and phoneId are the only mutable
// columns on the bridge, and changing either of them is semantically a
// delete + create, not an in-place update.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  studentPhoneId,
  studentPhoneStudentId,
  studentPhonePhoneId,
} from '../utils/RegEx/studentPhoneRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs StudentPhone.id ('id_estudiante_telefono'). Kept as a string
// pattern, not Joi.number(), since studentPhoneId is a digit-string RegEx.
const joiId = Joi.string().pattern(studentPhoneId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs StudentPhone.studentId ('id_estudiante'), the foreign key to Student.
const joiStudentId = Joi.string().pattern(studentPhoneStudentId).messages({
  'string.base': 'El id del estudiante debe ser una cadena de texto.',
  'string.pattern.base': 'El id del estudiante debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs StudentPhone.phoneId ('id_telefono'), the foreign key to Phone.
const joiPhoneId = Joi.string().pattern(studentPhonePhoneId).messages({
  'string.base': 'El id del teléfono debe ser una cadena de texto.',
  'string.pattern.base': 'El id del teléfono debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const studentPhoneSchema = {

  // POST /student-phones/get-by-id (body: { id })
  // Validates StudentPhoneServices.listOne(studentPhoneId)
  getStudentPhoneById: Joi.object({
    id: joiId.required(),
  }),

  // GET /student-phones/list-all → no input parameters, no schema applied.

  // POST /student-phones/get-by-student (body: { studentId })
  // Validates StudentPhoneServices.listByStudent(studentId)
  listStudentPhonesByStudent: Joi.object({
    studentId: joiStudentId.required(),
  }),

  // POST /student-phones/get-by-phone (body: { phoneId })
  // Validates StudentPhoneServices.listByPhone(phoneId)
  listStudentPhonesByPhone: Joi.object({
    phoneId: joiPhoneId.required(),
  }),

  // POST /student-phones/get-by-student-and-phone (body: { studentId, phoneId })
  // Validates StudentPhoneServices.getByStudentAndPhone(studentId, phoneId)
  getStudentPhoneByStudentAndPhone: Joi.object({
    studentId: joiStudentId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // POST /student-phones/create (body: { studentId, phoneId })
  // Validates StudentPhoneServices.createOne(newStudentPhone)
  newStudentPhoneData: Joi.object({
    studentId: joiStudentId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // DELETE /student-phones/delete (body: { id })
  // Validates StudentPhoneServices.deleteOne(studentPhoneId)
  deleteStudentPhone: Joi.object({
    id: joiId.required(),
  }),

  // DELETE /student-phones/unlink (body: { studentId, phoneId })
  // Validates StudentPhoneServices.unlinkByStudentAndPhone(studentId, phoneId)
  unlinkStudentPhone: Joi.object({
    studentId: joiStudentId.required(),
    phoneId: joiPhoneId.required(),
  }),
};

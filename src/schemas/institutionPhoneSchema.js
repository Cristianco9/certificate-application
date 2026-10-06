// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTION PHONE SCHEMA — Joi Validation
// Entity: InstitutionPhone | Table: institucion_telefono
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of InstitutionPhoneServices. The frontend
// sends every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take one or more primitive arguments on the service
// side (listOne, deleteOne, listByInstitution, listByPhone,
// getByInstitutionAndPhone, unlinkByInstitutionAndPhone) are still
// validated as a small object with one (or more) named keys, since Joi
// always validates an object shape.
//
// No 'update' schema exists: institutionId and phoneId are the only mutable
// columns on the bridge, and changing either of them is semantically a
// delete + create, not an in-place update.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  institutionPhoneId,
  institutionPhoneInstitutionId,
  institutionPhonePhoneId,
} from '../utils/RegEx/insitutionPhoneRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs InstitutionPhone.id ('id_institucion_telefono'). Kept as a string
// pattern, not Joi.number(), since institutionPhoneId is a digit-string RegEx.
const joiId = Joi.string().pattern(institutionPhoneId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs InstitutionPhone.institutionId ('id_institucion'), the foreign
// key to Institution.
const joiInstitutionId = Joi.string().pattern(institutionPhoneInstitutionId).messages({
  'string.base': 'El id de la institución debe ser una cadena de texto.',
  'string.pattern.base': 'El id de la institución debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs InstitutionPhone.phoneId ('id_telefono'), the foreign key to Phone.
const joiPhoneId = Joi.string().pattern(institutionPhonePhoneId).messages({
  'string.base': 'El id del teléfono debe ser una cadena de texto.',
  'string.pattern.base': 'El id del teléfono debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const institutionPhoneSchema = {

  // POST /institution-phones/get-by-id (body: { id })
  // Validates InstitutionPhoneServices.listOne(institutionPhoneId)
  getInstitutionPhoneById: Joi.object({
    id: joiId.required(),
  }),

  // GET /institution-phones/list-all → no input parameters, no schema applied.

  // POST /institution-phones/get-by-institution (body: { institutionId })
  // Validates InstitutionPhoneServices.listByInstitution(institutionId)
  listInstitutionPhonesByInstitution: Joi.object({
    institutionId: joiInstitutionId.required(),
  }),

  // POST /institution-phones/get-by-phone (body: { phoneId })
  // Validates InstitutionPhoneServices.listByPhone(phoneId)
  listInstitutionPhonesByPhone: Joi.object({
    phoneId: joiPhoneId.required(),
  }),

  // POST /institution-phones/get-by-institution-and-phone
  // (body: { institutionId, phoneId })
  // Validates InstitutionPhoneServices.getByInstitutionAndPhone(institutionId, phoneId)
  getInstitutionPhoneByInstitutionAndPhone: Joi.object({
    institutionId: joiInstitutionId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // POST /institution-phones/create (body: { institutionId, phoneId })
  // Validates InstitutionPhoneServices.createOne(newInstitutionPhone)
  newInstitutionPhoneData: Joi.object({
    institutionId: joiInstitutionId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // DELETE /institution-phones/delete (body: { id })
  // Validates InstitutionPhoneServices.deleteOne(institutionPhoneId)
  deleteInstitutionPhone: Joi.object({
    id: joiId.required(),
  }),

  // DELETE /institution-phones/unlink (body: { institutionId, phoneId })
  // Validates InstitutionPhoneServices.unlinkByInstitutionAndPhone(institutionId, phoneId)
  unlinkInstitutionPhone: Joi.object({
    institutionId: joiInstitutionId.required(),
    phoneId: joiPhoneId.required(),
  }),
};

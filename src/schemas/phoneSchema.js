// ─────────────────────────────────────────────────────────────────────────────
// PHONE SCHEMA — Joi Validation
// Entity: Phone | Table: telefono
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of PhoneServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByNumber, listByPartialNumber) are still
// validated as a small object with one named key, since Joi always
// validates an object shape.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  phoneId,
  phoneNumber,
} from '../utils/RegEx/phoneRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Phone.id ('id_telefono'). Kept as a string pattern, not Joi.number(),
// since phoneId is a digit-string RegEx.
const joiId = Joi.string().pattern(phoneId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Phone.number ('numero_telefono'). Unique and required.
const joiNumber = Joi.string().pattern(phoneNumber).messages({
  'string.base': 'El número de teléfono debe ser una cadena de texto.',
  'string.pattern.base': 'El número de teléfono debe ser un móvil colombiano (10 dígitos, comienza con 3) o un fijo (7 a 10 dígitos, con o sin +57).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const phoneSchema = {

  // POST /phones/get-by-id (body: { id })
  // Validates PhoneServices.listOne(phoneId)
  getPhoneById: Joi.object({
    id: joiId.required(),
  }),

  // GET /phones/list-all → no input parameters, no schema applied.

  // POST /phones/get-by-number (body: { number })
  // Validates PhoneServices.listByNumber(number)
  getPhoneByNumber: Joi.object({
    number: joiNumber.required(),
  }),

  // POST /phones/search-by-number (body: { partialNumber })
  // Validates PhoneServices.listByPartialNumber(partialNumber)
  searchPhonesByNumber: Joi.object({
    partialNumber: joiNumber.required(),
  }),

  // POST /phones (body: { number })
  // Validates PhoneServices.createOne(newPhone). 'number' is required.
  newPhoneData: Joi.object({
    number: joiNumber.required(),
  }),

  // PATCH /phones (body: { id, number })
  // Validates PhoneServices.updateOne(phoneId, newPhoneData).
  // 'id' and 'number' are required because number is the only mutable field.
  updatePhoneData: Joi.object({
    id: joiId.required(),
    number: joiNumber.required(),
  }),

  // DELETE /phones (body: { id })
  // Validates PhoneServices.deleteOne(phoneId)
  deletePhone: Joi.object({
    id: joiId.required(),
  }),

};

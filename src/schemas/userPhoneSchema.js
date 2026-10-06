// ─────────────────────────────────────────────────────────────────────────────
// USER PHONE SCHEMA — Joi Validation
// Entity: UserPhone | Table: usuario_telefono
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of UserPhoneServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take one or more primitive arguments on the service
// side (listOne, deleteOne, listByUser, listByPhone, getByUserAndPhone,
// unlinkByUserAndPhone) are still validated as a small object with one
// (or more) named keys, since Joi always validates an object shape.
//
// No 'update' schema exists: userId and phoneId are the only mutable
// columns on the bridge, and changing either of them is semantically a
// delete + create, not an in-place update.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  userPhoneId,
  userPhoneUserId,
  userPhonePhoneId,
} from '../utils/RegEx/userPhoneRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs UserPhone.id ('id_usuario_telefono'). Kept as a string pattern,
// not Joi.number(), since userPhoneId is a digit-string RegEx.
const joiId = Joi.string().pattern(userPhoneId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs UserPhone.userId ('id_usuario'), the foreign key to User.
const joiUserId = Joi.string().pattern(userPhoneUserId).messages({
  'string.base': 'El id del usuario debe ser una cadena de texto.',
  'string.pattern.base': 'El id del usuario debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs UserPhone.phoneId ('id_telefono'), the foreign key to Phone.
const joiPhoneId = Joi.string().pattern(userPhonePhoneId).messages({
  'string.base': 'El id del teléfono debe ser una cadena de texto.',
  'string.pattern.base': 'El id del teléfono debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const userPhoneSchema = {

  // POST /user-phones/get-by-id (body: { id })
  // Validates UserPhoneServices.listOne(userPhoneId)
  getUserPhoneById: Joi.object({
    id: joiId.required(),
  }),

  // GET /user-phones/list-all → no input parameters, no schema applied.

  // POST /user-phones/get-by-user (body: { userId })
  // Validates UserPhoneServices.listByUser(userId)
  listUserPhonesByUser: Joi.object({
    userId: joiUserId.required(),
  }),

  // POST /user-phones/get-by-phone (body: { phoneId })
  // Validates UserPhoneServices.listByPhone(phoneId)
  listUserPhonesByPhone: Joi.object({
    phoneId: joiPhoneId.required(),
  }),

  // POST /user-phones/get-by-user-and-phone (body: { userId, phoneId })
  // Validates UserPhoneServices.getByUserAndPhone(userId, phoneId)
  getUserPhoneByUserAndPhone: Joi.object({
    userId: joiUserId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // POST /user-phones/create (body: { userId, phoneId })
  // Validates UserPhoneServices.createOne(newUserPhone)
  newUserPhoneData: Joi.object({
    userId: joiUserId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // DELETE /user-phones/delete (body: { id })
  // Validates UserPhoneServices.deleteOne(userPhoneId)
  deleteUserPhone: Joi.object({
    id: joiId.required(),
  }),

  // DELETE /user-phones/unlink (body: { userId, phoneId })
  // Validates UserPhoneServices.unlinkByUserAndPhone(userId, phoneId)
  unlinkUserPhone: Joi.object({
    userId: joiUserId.required(),
    phoneId: joiPhoneId.required(),
  }),
};

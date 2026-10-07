// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATE RECIPIENT PHONE SCHEMA — Joi Validation
// Entity: CertificateRecipientPhone | Table: receptor_certificado_telefono
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of CertificateRecipientPhoneServices.
// The frontend sends every value through the request body — never via URL
// params or query string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take one or more primitive arguments on the service
// side (listOne, deleteOne, listByCertificateRecipient, listByPhone,
// getByCertificateRecipientAndPhone, unlinkByCertificateRecipientAndPhone)
// are still validated as a small object with one (or more) named keys,
// since Joi always validates an object shape.
//
// No 'update' schema exists: certificateRecipientId and phoneId are the
// only mutable columns on the bridge, and changing either of them is
// semantically a delete + create, not an in-place update.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  certificateRecipientPhoneId,
  certificateRecipientPhoneRecipientId,
  certificateRecipientPhonePhoneId,
} from '../utils/RegEx/certificateRecipientPhoneRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs CertificateRecipientPhone.id ('id_receptor_certificado_telefono').
// Kept as a string pattern, not Joi.number(), since
// certificateRecipientPhoneId is a digit-string RegEx.
const joiId = Joi.string().pattern(certificateRecipientPhoneId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs CertificateRecipientPhone.certificateRecipientId
// ('id_receptor_certificado'), the foreign key to CertificateRecipient.
const joiCertificateRecipientId = Joi.string().pattern(certificateRecipientPhoneRecipientId).messages({
  'string.base': 'El id del receptor del certificado debe ser una cadena de texto.',
  'string.pattern.base': 'El id del receptor del certificado debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs CertificateRecipientPhone.phoneId ('id_telefono'), the foreign
// key to Phone.
const joiPhoneId = Joi.string().pattern(certificateRecipientPhonePhoneId).messages({
  'string.base': 'El id del teléfono debe ser una cadena de texto.',
  'string.pattern.base': 'El id del teléfono debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const certificateRecipientPhoneSchema = {

  // POST /certificate-recipient-phones/get-by-id (body: { id })
  // Validates CertificateRecipientPhoneServices.listOne(certificateRecipientPhoneId)
  getCertificateRecipientPhoneById: Joi.object({
    id: joiId.required(),
  }),

  // GET /certificate-recipient-phones/list-all → no input parameters,
  // no schema applied.

  // POST /certificate-recipient-phones/get-by-certificate-recipient
  // (body: { certificateRecipientId })
  // Validates CertificateRecipientPhoneServices.listByCertificateRecipient(certificateRecipientId)
  listCertificateRecipientPhonesByCertificateRecipient: Joi.object({
    certificateRecipientId: joiCertificateRecipientId.required(),
  }),

  // POST /certificate-recipient-phones/get-by-phone (body: { phoneId })
  // Validates CertificateRecipientPhoneServices.listByPhone(phoneId)
  listCertificateRecipientPhonesByPhone: Joi.object({
    phoneId: joiPhoneId.required(),
  }),

  // POST /certificate-recipient-phones/get-by-certificate-recipient-and-phone
  // (body: { certificateRecipientId, phoneId })
  // Validates CertificateRecipientPhoneServices.getByCertificateRecipientAndPhone(certificateRecipientId, phoneId)
  getCertificateRecipientPhoneByCertificateRecipientAndPhone: Joi.object({
    certificateRecipientId: joiCertificateRecipientId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // POST /certificate-recipient-phones/create
  // (body: { certificateRecipientId, phoneId })
  // Validates CertificateRecipientPhoneServices.createOne(newCertificateRecipientPhone)
  newCertificateRecipientPhoneData: Joi.object({
    certificateRecipientId: joiCertificateRecipientId.required(),
    phoneId: joiPhoneId.required(),
  }),

  // DELETE /certificate-recipient-phones/delete (body: { id })
  // Validates CertificateRecipientPhoneServices.deleteOne(certificateRecipientPhoneId)
  deleteCertificateRecipientPhone: Joi.object({
    id: joiId.required(),
  }),

  // DELETE /certificate-recipient-phones/unlink
  // (body: { certificateRecipientId, phoneId })
  // Validates CertificateRecipientPhoneServices.unlinkByCertificateRecipientAndPhone(certificateRecipientId, phoneId)
  unlinkCertificateRecipientPhone: Joi.object({
    certificateRecipientId: joiCertificateRecipientId.required(),
    phoneId: joiPhoneId.required(),
  }),
};

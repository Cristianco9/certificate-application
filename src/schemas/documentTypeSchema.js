// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPE SCHEMA — Joi Validation
// Entity: DocumentType | Table: tipo_documento
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of DocumentTypeServices. The frontend
// sends every value through the request body — never via URL params or
// query string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByName) are still validated as a small object
// with one named key, since Joi always validates an object shape.
// 'name' is backed by a closed ENUM (see documentTypeRegEx.js), so — like
// Gender and unlike Country/Department/Municipality — there is no
// partial-text search endpoint here.

import Joi from 'joi';

import { documentTypeId, documentTypeName } from '../utils/RegEx/documentTypeRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs DocumentType.id ('id_tipo_documento'). Kept as a string
// pattern, not Joi.number(), since documentTypeId is a digit-string RegEx.
const joiId = Joi.string().pattern(documentTypeId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs DocumentType.name ('nombre_tipodocumento')
const joiName = Joi.string().pattern(documentTypeName).messages({
  'string.base': 'El nombre del tipo de documento debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre del tipo de documento debe tener entre 3 y 50 caracteres y contener solo letras, espacios y paréntesis.',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const documentTypeSchema = {

  // POST /document-types/get-by-id (body: { id })
  // Validates DocumentTypeServices.listOne(documentTypeId)
  getDocumentTypeById: Joi.object({
    id: joiId.required(),
  }),

  // GET /document-types/list ()
  // Validates DocumentTypeServices.listAll() — no input parameters, so
  // no schema is applied to this endpoint.

  // POST /document-types/get-by-name (body: { name })
  // Validates DocumentTypeServices.listByName(name). Exact lookup,
  // since 'name' is a closed ENUM — no partial-text search endpoint.
  getDocumentTypeByName: Joi.object({
    name: joiName.required(),
  }),

  // POST /document-types (body: { name })
  // Validates DocumentTypeServices.createOne(newDocumentType). 'name'
  // is required, matching allowNull: false on the column.
  newDocumentTypeData: Joi.object({
    name: joiName.required(),
  }),

  // PATCH /document-types (body: { id, name })
  // Validates BOTH arguments of DocumentTypeServices.updateOne
  // (documentTypeId, newDocumentTypeData) in a single object, since the
  // frontend sends the id inside the body rather than as a route param.
  // 'name' is required here (rather than optional) because it is the
  // entity's only mutable field — with a single updatable column,
  // there is no meaningful partial update short of providing it.
  updateDocumentTypeData: Joi.object({
    id: joiId.required(),
    name: joiName.required(),
  }),

  // DELETE /document-types (body: { id })
  // Validates DocumentTypeServices.deleteOne(documentTypeId)
  deleteDocumentType: Joi.object({
    id: joiId.required(),
  }),

};

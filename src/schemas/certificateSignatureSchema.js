// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATE SIGNATURE SCHEMA — Joi Validation
// Entity: CertificateSignature | Table: firma_certificado
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of CertificateSignatureServices. The
// frontend sends every value through the request body — never via URL
// params or query string — so every schema below is meant to be applied
// as validatorHandler(schema, 'body'), including the ones that only
// carry an id. Methods that take one or more primitive arguments on the
// service side are still validated as a small object with one (or more)
// named keys, since Joi always validates an object shape.
//
// The 'update' schema intentionally does NOT include 'userId':
// 'id_usuario_firmacertificado' is UNIQUE in the database, so
// reassigning a signature to a different signer is semantically a
// delete + create, not an in-place update.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  certificateSignatureId,
  certificateSignatureUserId,
  certificateSignatureCertificateId,
  certificateSignatureMunicipalityId,
} from '../utils/RegEx/certificateSignatureRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs CertificateSignature.id ('id_firma_firmacertificado'). Kept as a
// string pattern, not Joi.number(), since certificateSignatureId is a
// digit-string RegEx.
const joiId = Joi.string().pattern(certificateSignatureId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs CertificateSignature.userId ('id_usuario_firmacertificado'),
// the foreign key to User (the signer).
const joiUserId = Joi.string().pattern(certificateSignatureUserId).messages({
  'string.base': 'El id del firmante debe ser una cadena de texto.',
  'string.pattern.base': 'El id del firmante debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs CertificateSignature.certificateId ('id_certificado_firmacertificado'),
// the foreign key to Certificate.
const joiCertificateId = Joi.string().pattern(certificateSignatureCertificateId).messages({
  'string.base': 'El id del certificado debe ser una cadena de texto.',
  'string.pattern.base': 'El id del certificado debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs CertificateSignature.municipalityId ('id_municipio'), the foreign
// key to Municipality.
const joiMunicipalityId = Joi.string().pattern(certificateSignatureMunicipalityId).messages({
  'string.base': 'El id del municipio debe ser una cadena de texto.',
  'string.pattern.base': 'El id del municipio debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const certificateSignatureSchema = {

  // POST /certificate-signatures/get-by-id (body: { id })
  // Validates CertificateSignatureServices.listOne(certificateSignatureId)
  getCertificateSignatureById: Joi.object({
    id: joiId.required(),
  }),

  // GET /certificate-signatures/list-all → no input parameters, no schema applied.

  // POST /certificate-signatures/get-by-certificate (body: { certificateId })
  // Validates CertificateSignatureServices.listByCertificate(certificateId).
  // Returns a collection: a certificate can carry many signatures.
  listCertificateSignaturesByCertificate: Joi.object({
    certificateId: joiCertificateId.required(),
  }),

  // POST /certificate-signatures/get-by-municipality (body: { municipalityId })
  // Validates CertificateSignatureServices.listByMunicipality(municipalityId)
  listCertificateSignaturesByMunicipality: Joi.object({
    municipalityId: joiMunicipalityId.required(),
  }),

  // POST /certificate-signatures/get-by-signer (body: { userId })
  // Validates CertificateSignatureServices.getBySigner(userId).
  // Returns a single record, not a collection, because the signer FK is
  // UNIQUE on this table.
  getCertificateSignatureBySigner: Joi.object({
    userId: joiUserId.required(),
  }),

  // POST /certificate-signatures/get-by-certificate-and-signer
  // (body: { certificateId, userId })
  // Validates CertificateSignatureServices.getByCertificateAndSigner(certificateId, userId)
  getCertificateSignatureByCertificateAndSigner: Joi.object({
    certificateId: joiCertificateId.required(),
    userId: joiUserId.required(),
  }),

  // POST /certificate-signatures/create (body: { userId, certificateId, municipalityId })
  // Validates CertificateSignatureServices.createOne(newCertificateSignature).
  // All three fields are required, matching allowNull: false on those columns.
  newCertificateSignatureData: Joi.object({
    userId: joiUserId.required(),
    certificateId: joiCertificateId.required(),
    municipalityId: joiMunicipalityId.required(),
  }),

  // PATCH /certificate-signatures/update
  // (body: { id, certificateId?, municipalityId? })
  // Validates BOTH arguments of CertificateSignatureServices.updateOne
  // (certificateSignatureId, newCertificateSignatureData) in a single
  // object. 'userId' is intentionally NOT a mutable field here: the
  // UNIQUE constraint on the signer column makes a signer change
  // semantically a delete + create.
  updateCertificateSignatureData: Joi.object({
    id: joiId.required(),
    certificateId: joiCertificateId,
    municipalityId: joiMunicipalityId,
  }).or('certificateId', 'municipalityId').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos certificateId o municipalityId para actualizar la firma del certificado.',
  }),

  // DELETE /certificate-signatures/delete (body: { id })
  // Validates CertificateSignatureServices.deleteOne(certificateSignatureId)
  deleteCertificateSignature: Joi.object({
    id: joiId.required(),
  }),

};

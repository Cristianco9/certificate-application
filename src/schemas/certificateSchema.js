// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATE SCHEMA — Joi Validation
// Entity: Certificate | Table: certificado
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of CertificateServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id or a single primitive argument. Methods that take a single primitive
// argument on the service side (listOne, deleteOne, listByActNumber,
// listByEnrollment, listByUser, listByInstitution, listByStatus, reprint,
// voidOne) are still validated as a small object with one named key, since
// Joi always validates an object shape.
//
// 'status' is backed by a fixed MySQL ENUM, so it is validated with
// Joi.valid() rather than a RegEx pattern. 'issueDate' is validated with
// Joi.date().
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi';

import {
  certificateId,
  certificateUserId,
  certificateInstitutionId,
  certificateEnrollmentId,
  certificateRecipientId,
  certificateActNumber,
} from '../utils/RegEx/certificateRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Certificate.id ('id_certificado'). Kept as a string pattern, not
// Joi.number(), since certificateId is a digit-string RegEx.
const joiId = Joi.string().pattern(certificateId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Certificate.userId ('id_usuario_certificado'). The issuing staff member.
const joiUserId = Joi.string().pattern(certificateUserId).messages({
  'string.base': 'El id del usuario debe ser una cadena de texto.',
  'string.pattern.base': 'El id del usuario debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Certificate.institutionId ('id_institucion_certificado').
const joiInstitutionId = Joi.string().pattern(certificateInstitutionId).messages({
  'string.base': 'El id de la institución debe ser una cadena de texto.',
  'string.pattern.base': 'El id de la institución debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Certificate.enrollmentId ('id_matricula_certificado'). Unique
// constraint at the database level: one certificate per enrollment.
const joiEnrollmentId = Joi.string().pattern(certificateEnrollmentId).messages({
  'string.base': 'El id de la matrícula debe ser una cadena de texto.',
  'string.pattern.base': 'El id de la matrícula debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Certificate.recipientId ('id_receptor_certificado'). Nullable at the
// database level, so it is never marked .required() by default.
const joiRecipientId = Joi.string().pattern(certificateRecipientId).messages({
  'string.base': 'El id del receptor debe ser una cadena de texto.',
  'string.pattern.base': 'El id del receptor debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Certificate.actNumber ('numero_acta_certificado'). Generated
// automatically by the service (not provided by the client), so it is only
// used for lookup schemas (listByActNumber), never for creation or update.
const joiActNumber = Joi.string().pattern(certificateActNumber).messages({
  'string.base': 'El número de acta debe ser una cadena de texto.',
  'string.pattern.base': 'El número de acta debe tener el formato: AAAA-NNNN (año-consecutivo) o PREFIJO-AAAA-NNNN (ej. ACTA-2026-0123).',
});

// Backs Certificate.issueDate ('fecha_emision_certificado'). Validated as
// a native date, not a string pattern.
const joiIssueDate = Joi.date().messages({
  'date.base': 'La fecha de emisión debe ser una fecha válida.',
});

// Backs Certificate.status ('estado_certificado'). ENUM('EMITIDO','ANULADO','REIMPRESO').
const joiStatus = Joi.string().valid('EMITIDO', 'ANULADO', 'REIMPRESO').messages({
  'string.base': 'El estado debe ser una cadena de texto.',
  'any.only': 'El estado debe ser "EMITIDO", "ANULADO" o "REIMPRESO".',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const certificateSchema = {

  // ── Single-record lookups ──────────────────────────────────────────────────

  // POST /certificates/get-by-id (body: { id })
  // Validates CertificateServices.listOne(certificateId)
  getCertificateById: Joi.object({
    id: joiId.required(),
  }),

  // GET /certificates/list-all → no input parameters, no schema applied.

  // POST /certificates/get-by-act-number (body: { actNumber })
  // Validates CertificateServices.listByActNumber(actNumber)
  getCertificateByActNumber: Joi.object({
    actNumber: joiActNumber.required(),
  }),

  // POST /certificates/get-by-enrollment (body: { enrollmentId })
  // Validates CertificateServices.listByEnrollment(enrollmentId)
  getCertificateByEnrollment: Joi.object({
    enrollmentId: joiEnrollmentId.required(),
  }),

  // POST /certificates/get-by-user (body: { userId })
  // Validates CertificateServices.listByUser(userId)
  listCertificatesByUser: Joi.object({
    userId: joiUserId.required(),
  }),

  // POST /certificates/get-by-institution (body: { institutionId })
  // Validates CertificateServices.listByInstitution(institutionId)
  listCertificatesByInstitution: Joi.object({
    institutionId: joiInstitutionId.required(),
  }),

  // POST /certificates/get-by-status (body: { status })
  // Validates CertificateServices.listByStatus(status)
  listCertificatesByStatus: Joi.object({
    status: joiStatus.required(),
  }),

  // POST /certificates/get-by-date-range (body: { startDate, endDate })
  // Validates CertificateServices.listByDateRange(startDate, endDate)
  listCertificatesByDateRange: Joi.object({
    startDate: joiIssueDate.required(),
    endDate: joiIssueDate.required(),
  }),

  // ── Write operations ──────────────────────────────────────────────────────

  // POST /certificates (body: { issueDate, userId, institutionId, enrollmentId, recipientId? })
  // Validates CertificateServices.createOne(newCertificate).
  // 'issueDate', 'userId', 'institutionId' and 'enrollmentId' are required,
  // matching allowNull: false. 'recipientId' is optional (allowNull: true).
  // 'actNumber' is NOT included because it is auto-generated by the service.
  newCertificateData: Joi.object({
    issueDate: joiIssueDate.required(),
    userId: joiUserId.required(),
    institutionId: joiInstitutionId.required(),
    enrollmentId: joiEnrollmentId.required(),
    recipientId: joiRecipientId,
  }),

  // PATCH /certificates (body: { id, recipientId?, status? })
  // Validates CertificateServices.updateOne(certificateId, newCertificateData).
  // Only 'recipientId' and 'status' are mutable through this method.
  // 'id' is always required; at least one mutable field must be present.
  updateCertificateData: Joi.object({
    id: joiId.required(),
    recipientId: joiRecipientId,
    status: joiStatus,
  }).or('recipientId', 'status').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos recipientId o status para actualizar el certificado.',
  }),

  // ── Special business operations ──────────────────────────────────────────

  // POST /certificates/reprint (body: { id })
  // Validates CertificateServices.reprint(certificateId)
  reprintCertificate: Joi.object({
    id: joiId.required(),
  }),

  // POST /certificates/void (body: { id })
  // Validates CertificateServices.voidOne(certificateId)
  voidCertificate: Joi.object({
    id: joiId.required(),
  }),

  // DELETE /certificates (body: { id })
  // Validates CertificateServices.deleteOne(certificateId)
  deleteCertificate: Joi.object({
    id: joiId.required(),
  }),

};

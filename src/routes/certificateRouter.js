// ────────────────────────────────────────────────────────────────────────────
// CERTIFICATE ROUTER
// Entity: Certificate | Table: certificado
//
// Defines and exposes the HTTP endpoints used to manage the "certificate"
// entity. This is the core business entity of the system (see context.md):
// certificates are issued for enrollments, can be reprinted, voided, and
// queried by various criteria. Every route is protected and only users
// whose JWT carries the appropriate role are allowed to operate on it.
//
// Security pipeline applied to each route (in this strict order, per
// AGENTS.md section 7):
//   1. validatorHandler(schema, 'body') → validates the incoming payload
//      (Joi). Never touches the database or downstream middlewares with
//      unvalidated data.
//   2. checkApiKey → verifies the client app's API key.
//   3. authAppVerifyToken → validates the session JWT and rotates it.
//   4. checkRole([...]) → authorizes only the allowed roles (when the
//      route requires role-based control, applied right after the token
//      check since it depends on the decoded JWT).
//   5. controller → executes the business operation and builds the response.
//
// Mounted at: /app/v1/certificates  (see src/routes/index.js)
// ────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';

// ── Middlewares ─────────────────────────────────────────────────────────────

import { validatorHandler } from '../middlewares/validatorHandler.js';
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
import { authAppVerifyToken } from '../middlewares/tokenHandlers/authAppTokenHandler.js';
import { checkRole } from '../middlewares/checkRoleHandler.js';

// ── Validation schema ───────────────────────────────────────────────────────

import { certificateSchema } from '../schemas/certificateSchema.js';

// ── Controllers ─────────────────────────────────────────────────────────────

import { createOneCertificate } from '../controllers/certificate/create.js';
import { updateOneCertificate } from '../controllers/certificate/update.js';
import { reprintCertificate } from '../controllers/certificate/reprint.js';
import { voidCertificate } from '../controllers/certificate/void.js';
import { deleteOneCertificate } from '../controllers/certificate/delete.js';
import { listOneCertificate } from '../controllers/certificate/listOne.js';
import { listAllCertificates } from '../controllers/certificate/listAll.js';
import { getCertificateByActNumber } from '../controllers/certificate/listByActNumber.js';
import { getCertificateByEnrollment } from '../controllers/certificate/listByEnrollment.js';
import { listCertificatesByUser } from '../controllers/certificate/listByUser.js';
import { listCertificatesByInstitution } from '../controllers/certificate/listByInstitution.js';
import { listCertificatesByStatus } from '../controllers/certificate/listByStatus.js';
import { listCertificatesByDateRange } from '../controllers/certificate/listByDateRange.js';

// Create a new Router instance dedicated to the certificate resource
const certificateRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /create  →  Issue a new certificate
// Body: { issueDate, userId, institutionId, enrollmentId, recipientId? }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/create',
  checkApiKey,
  validatorHandler(certificateSchema.newCertificateData, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  createOneCertificate
);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /update  →  Update mutable fields of an existing certificate
// Body: { id, recipientId?, status? }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.patch(
  '/update',
  checkApiKey,
  validatorHandler(certificateSchema.updateCertificateData, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  updateOneCertificate
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /reprint  →  Reprint an existing certificate
// Body: { id }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/reprint',
  checkApiKey,
  validatorHandler(certificateSchema.reprintCertificate, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  reprintCertificate
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /void  →  Void an existing certificate
// Body: { id }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/void',
  checkApiKey,
  validatorHandler(certificateSchema.voidCertificate, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  voidCertificate
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /delete  →  Delete a certificate by id
// Body: { id }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.delete(
  '/delete',
  checkApiKey,
  validatorHandler(certificateSchema.deleteCertificate, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  deleteOneCertificate
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /list-all  →  List every certificate (ordered by issueDate DESC)
// Body: {} (no payload to validate)
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.get(
  '/list-all',
  checkApiKey,
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  listAllCertificates
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /list-one  →  Retrieve a single certificate by id
// Body: { id }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.get(
  '/list-one',
  checkApiKey,
  validatorHandler(certificateSchema.getCertificateById, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  listOneCertificate
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /get-by-act-number  →  Retrieve a certificate by its act number
// Body: { actNumber }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/get-by-act-number',
  checkApiKey,
  validatorHandler(certificateSchema.getCertificateByActNumber, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  getCertificateByActNumber
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /get-by-enrollment  →  Retrieve the certificate for a given enrollment
// Body: { enrollmentId }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/get-by-enrollment',
  checkApiKey,
  validatorHandler(certificateSchema.getCertificateByEnrollment, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  getCertificateByEnrollment
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /get-by-user  →  List certificates issued by a given user
// Body: { userId }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/get-by-user',
  checkApiKey,
  validatorHandler(certificateSchema.listCertificatesByUser, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  listCertificatesByUser
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /get-by-institution  →  List certificates issued under a given institution
// Body: { institutionId }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/get-by-institution',
  checkApiKey,
  validatorHandler(certificateSchema.listCertificatesByInstitution, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  listCertificatesByInstitution
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /get-by-status  →  List certificates with a given status
// Body: { status }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/get-by-status',
  checkApiKey,
  validatorHandler(certificateSchema.listCertificatesByStatus, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  listCertificatesByStatus
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /get-by-date-range  →  List certificates issued within a date range
// Body: { startDate, endDate }
// ─────────────────────────────────────────────────────────────────────────────
certificateRouter.post(
  '/get-by-date-range',
  checkApiKey,
  validatorHandler(certificateSchema.listCertificatesByDateRange, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario']),
  listCertificatesByDateRange
);

export default certificateRouter;

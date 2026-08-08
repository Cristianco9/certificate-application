// ────────────────────────────────────────────────────────────────────────────
// INSTITUTION ROUTER
// Entity: Institution | Table: institucion
//
// Defines and exposes the HTTP endpoints used to manage the "institution"
// catalog. This is an administrative catalog: every route is protected and
// only users whose JWT carries the appropriate role are allowed to operate
// on it.
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
// Mounted at: /app/v1/institutions (see src/routes/index.js)
// ────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';

// ── Middlewares ─────────────────────────────────────────────────────────────

import { validatorHandler } from '../middlewares/validatorHandler.js';
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
import { authAppVerifyToken } from '../middlewares/tokenHandlers/authAppTokenHandler.js';
import { checkRole } from '../middlewares/checkRoleHandler.js';

// ── Validation schema ───────────────────────────────────────────────────────

import { institutionSchema } from '../schemas/institutionSchema.js';

// ── Controllers ─────────────────────────────────────────────────────────────

import { createOneInstitution } from '../controllers/institution/create.js';
import { listAllInstitutions } from '../controllers/institution/listAll.js';
import { listOneInstitution } from '../controllers/institution/listOne.js';
import { searchInstitutionsByName } from '../controllers/institution/searchByName.js';
import { getInstitutionByInstitutionalCode } from '../controllers/institution/getByInstitutionalCode.js';
import { getInstitutionByNit } from '../controllers/institution/getByNit.js';
import { updateOneInstitution } from '../controllers/institution/update.js';
import { deleteOneInstitution } from '../controllers/institution/delete.js';

const institutionRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /create  →  Create a new institution
// Body: { name, institutionalCode, address, municipalityId?, email, nitId }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.post(
  '/create',
  checkApiKey,
  validatorHandler(institutionSchema.newInstitutionData, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  createOneInstitution
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /list-all  →  List every institution
// Body: {} (no payload to validate)
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.get(
  '/list-all',
  checkApiKey,
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador', 'Rector', 'Funcionario', 'Auxiliar']),
  listAllInstitutions
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /list-one  →  Retrieve a single institution by id
// Body: { id }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.get(
  '/list-one',
  checkApiKey,
  validatorHandler(institutionSchema.getInstitutionById, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  listOneInstitution
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /search-by-name  →  Search institutions by partial name
// Body: { partialName }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.post(
  '/search-by-name',
  checkApiKey,
  validatorHandler(institutionSchema.searchInstitutionsByName, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  searchInstitutionsByName
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /get-by-institutional-code  →  Retrieve institution by institutional code
// Body: { institutionalCode }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.get(
  '/get-by-institutional-code',
  checkApiKey,
  validatorHandler(institutionSchema.getInstitutionByInstitutionalCode, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  getInstitutionByInstitutionalCode
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /get-by-nit  →  Retrieve institution by NIT
// Body: { nitId }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.get(
  '/get-by-nit',
  checkApiKey,
  validatorHandler(institutionSchema.getInstitutionByNit, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  getInstitutionByNit
);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /update  →  Update an existing institution
// Body: { id, name?, institutionalCode?, address?, municipalityId?, email?, nitId? }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.patch(
  '/update',
  checkApiKey,
  validatorHandler(institutionSchema.updateInstitutionData, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  updateOneInstitution
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /delete  →  Delete an institution by id
// Body: { id }
// ─────────────────────────────────────────────────────────────────────────────
institutionRouter.delete(
  '/delete',
  checkApiKey,
  validatorHandler(institutionSchema.deleteInstitution, 'body'),
  authAppVerifyToken,
  checkRole(['Máster', 'Administrador']),
  deleteOneInstitution
);

export default institutionRouter;

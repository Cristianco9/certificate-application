// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTION SCHEMA — Joi Validation
// Entity: Institution | Table: institucion
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps 1:1 to the public methods of InstitutionServices. The frontend sends
// every value through the request body — never via URL params or query
// string — so every schema below is meant to be applied as
// validatorHandler(schema, 'body'), including the ones that only carry an
// id. Methods that take a single primitive argument on the service side
// (listOne, deleteOne, listByPartialName, listByInstitutionalCode, listByNit,
// listByMunicipality) are still validated as a small object with one named
// key, since Joi always validates an object shape.

import Joi from 'joi';

import {
  institutionId,
  institutionName,
  institutionalCode,
  institutionAddress,
  institutionEmail,
  institutionNitId,
  institutionMunicipalityId,
} from '../utils/RegEx/institutionRegEx.js';

// ── Primitive Joi types ─────────────────────────────────────────────────────

// Backs Institution.id ('id_institucion'). Kept as a string pattern, not
// Joi.number(), since institutionId is a digit-string RegEx.
const joiId = Joi.string().pattern(institutionId).messages({
  'string.base': 'El id debe ser una cadena de texto.',
  'string.pattern.base': 'El id debe contener solo dígitos (1 a 10 dígitos).',
});

// Backs Institution.name ('nombre_institucion')
const joiName = Joi.string().pattern(institutionName).messages({
  'string.base': 'El nombre de la institución debe ser una cadena de texto.',
  'string.pattern.base': 'El nombre de la institución debe tener entre 3 y 50 caracteres y contener solo letras, números y espacios.',
});

// Backs Institution.institutionalCode ('codigo_institucional', DANE code)
const joiInstitutionalCode = Joi.string().pattern(institutionalCode).messages({
  'string.base': 'El código institucional debe ser una cadena de texto.',
  'string.pattern.base': 'El código institucional debe tener entre 3 y 50 caracteres y contener solo letras mayúsculas y números.',
});

// Backs Institution.address ('direccion_institucion')
const joiAddress = Joi.string().pattern(institutionAddress).messages({
  'string.base': 'La dirección debe ser una cadena de texto.',
  'string.pattern.base': 'La dirección debe tener entre 5 y 200 caracteres y contener solo letras, números, espacios y los símbolos # - ,',
});

// Backs Institution.email ('email_institucion')
const joiEmail = Joi.string().pattern(institutionEmail).messages({
  'string.base': 'El correo electrónico debe ser una cadena de texto.',
  'string.pattern.base': 'El correo electrónico debe tener un formato válido (ejemplo@dominio.com).',
});

// Backs Institution.nitId ('nit_institucion')
const joiNitId = Joi.string().pattern(institutionNitId).messages({
  'string.base': 'El NIT debe ser una cadena de texto.',
  'string.pattern.base': 'El NIT debe tener entre 9 y 10 dígitos base, seguidos de un guion y el dígito de verificación (ejemplo: 900123456-7).',
});

// Backs Institution.municipalityId ('id_municipio_institucion'). Nullable
// at the database level, so it is never marked .required() by default —
// each schema below opts in to requiring it only where the business flow
// demands it.
const joiMunicipalityId = Joi.string().pattern(institutionMunicipalityId).messages({
  'string.base': 'El id del municipio debe ser una cadena de texto.',
  'string.pattern.base': 'El id del municipio debe contener solo dígitos (1 a 10 dígitos).',
});

// ── Schema export ────────────────────────────────────────────────────────────

export const institutionSchema = {

  // POST /institutions/get-by-id (body: { id })
  // Validates InstitutionServices.listOne(institutionId)
  getInstitutionById: Joi.object({
    id: joiId.required(),
  }),

  // GET /institutions/list ()
  // Validates InstitutionServices.listAll() — no input parameters, so no
  // schema is applied to this endpoint.

  // POST /institutions/search-by-name (body: { partialName })
  // Validates InstitutionServices.listByPartialName(partialName). Reuses
  // the same character-set rule as 'name' (letters, digits and spaces),
  // since a search box should accept partial matches over the same
  // free-text field.
  searchInstitutionsByName: Joi.object({
    partialName: joiName.required(),
  }),

  // POST /institutions/get-by-institutional-code (body: { institutionalCode })
  // Validates InstitutionServices.listByInstitutionalCode(institutionalCode).
  // ENUM-like exact lookup (assigned by the Ministry of Education), so no
  // partial-search endpoint is defined for this field.
  getInstitutionByInstitutionalCode: Joi.object({
    institutionalCode: joiInstitutionalCode.required(),
  }),

  // POST /institutions/get-by-nit (body: { nitId })
  // Validates InstitutionServices.listByNit(nitId). Exact lookup only,
  // since the NIT is a unique tax identifier and not meant for partial
  // search.
  getInstitutionByNit: Joi.object({
    nitId: joiNitId.required(),
  }),

  // POST /institutions/get-by-municipality (body: { municipalityId })
  // Validates InstitutionServices.listByMunicipality(municipalityId)
  getInstitutionsByMunicipality: Joi.object({
    municipalityId: joiMunicipalityId.required(),
  }),

  // POST /institutions (body: { name, institutionalCode, address,
  // municipalityId?, email, nitId })
  // Validates InstitutionServices.createOne(newInstitution). 'name',
  // 'institutionalCode', 'address', 'email' and 'nitId' are required,
  // matching allowNull: false; 'municipalityId' is optional, matching
  // allowNull: true on the column.
  newInstitutionData: Joi.object({
    name: joiName.required(),
    institutionalCode: joiInstitutionalCode.required(),
    address: joiAddress.required(),
    municipalityId: joiMunicipalityId,
    email: joiEmail.required(),
    nitId: joiNitId.required(),
  }),

  // PATCH /institutions (body: { id, name?, institutionalCode?, address?,
  // municipalityId?, email?, nitId? })
  // Validates BOTH arguments of InstitutionServices.updateOne(institutionId,
  // newInstitutionData) in a single object, since the frontend sends the id
  // inside the body rather than as a route param. 'id' is always required;
  // at least one of the mutable fields must also be present so the request
  // carries something to update.
  updateInstitutionData: Joi.object({
    id: joiId.required(),
    name: joiName,
    institutionalCode: joiInstitutionalCode,
    address: joiAddress,
    municipalityId: joiMunicipalityId,
    email: joiEmail,
    nitId: joiNitId,
  }).or('name', 'institutionalCode', 'address', 'municipalityId', 'email', 'nitId').messages({
    'object.missing': 'Debe proporcionar al menos uno de los campos name, institutionalCode, address, municipalityId, email o nitId para actualizar la institución.',
  }),

  // DELETE /institutions (body: { id })
  // Validates InstitutionServices.deleteOne(institutionId)
  deleteInstitution: Joi.object({
    id: joiId.required(),
  }),

};

// The pattern ensures the official record/act number accepts either:
// - a plain year-based consecutive (e.g. '2026-0123'), or
// - a prefixed consecutive with an uppercase letter prefix, year, and
//   consecutive number, separated by hyphens (e.g. 'ACTA-2026-0123')
// where the year is a 4-digit number and the consecutive is 3 to 6
// digits, matching the VARCHAR(30) column size defined in
// certificado.numero_acta_certificado
export const certificateActNumber = /^([A-Z]{2,10}-)?\d{4}-\d{3,6}$/;

// The pattern ensures the certificate id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in certificado.id_certificado
export const certificateId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Usuario contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in certificado.id_usuario_certificado
export const certificateUserId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Institucion contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in certificado.id_institucion_certificado
export const certificateInstitutionId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Matricula contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in certificado.id_matricula_certificado
export const certificateEnrollmentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to ReceptorCertificado contains
// only numbers and is between 1 to 10 digits long, matching the
// INTEGER foreign key defined in certificado.id_receptor_certificado.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const certificateRecipientId = /^\d{1,10}$/;

// NOTE: 'fecha_emision_certificado' (DATE) y 'estado_certificado'
// (ENUM('EMITIDO','ANULADO','REIMPRESO')) are not covered by regular
// expressions here. Date values are validated at the schema layer with
// Joi.date(), and enumerated values with Joi.valid(...), both of which
// offer more appropriate native validation than a text-based pattern.

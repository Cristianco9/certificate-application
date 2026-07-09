// The pattern ensures the original score accepts either:
// - a numeric grade from 0.0 to 5.0, with exactly one decimal digit
//   (e.g. '3.5', '5.0', '0.0'), matching the NUMERICA scoring type, or
// - one of the four fixed alphabetic grade labels used by the
//   institution ('Insuficiente', 'Aceptable', 'Sobresaliente',
//   'Excelente'), matching the ALFABETICA scoring type
// as defined in context.md. This value is stored exactly as originally
// recorded and must never be modified, matching the
// VARCHAR(20) column size defined in
// calificacion.nota_original_calificacion
export const scoreOriginalValue = /^([0-5]\.\d|Deficiente|Insuficiente|Aceptable|Sobresaliente|Excelente)$/;

// The pattern ensures the remedial/make-up score ('nota de
// habilitación') follows the same numeric grade format as the original
// score, from 0.0 to 5.0 with exactly one decimal digit,
// matching the VARCHAR(20) column size defined in
// calificacion.nota_habilitacion
export const scoreRemedialValue = /^([0-5]\.\d|Deficiente|Insuficiente|Aceptable|Sobresaliente|Excelente)$/;

// The pattern ensures the score id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in calificacion.id_calificacion
export const scoreId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Asignatura contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in calificacion.id_asignatura_calificacion
export const scoreSubjectId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Matricula contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in calificacion.id_matricula_calificacion
export const scoreEnrollmentId = /^\d{1,10}$/;

// NOTE: 'tipo_nota_calificacion' (ENUM('NUMERICA','ALFABETICA')) is not
// covered by a regular expression here. Enumerated values are validated
// at the schema layer with Joi.valid(...) instead. Additionally, the
// schema layer should enforce that scoreOriginalValue matches the
// numeric or alphabetic sub-pattern consistent with the value chosen
// for tipo_nota_calificacion (e.g. via Joi.when()), since this regex
// alone accepts either format regardless of the declared type.

// The pattern ensures the group name contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}), digits, and the
// hyphen symbol (to allow values such as '11-A' or 'Sexto-B'),
// and is between 1 to 50 characters long, matching the
// VARCHAR(50) column size defined in grupo.nombre_grupo
export const groupName = /^[\p{L}\d-]{1,50}$/u;

// The pattern ensures the academic year contains exactly 4 digits,
// matching the YEAR column defined in grupo.anio_grupo
// (application-level model maps this as INTEGER; this pattern still
// restricts the value to a realistic 4-digit calendar year)
export const groupYear = /^\d{4}$/;

// The pattern ensures the group id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in grupo.id_grupo
export const groupId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Grado contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in grupo.id_grado_grupo.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const groupGradeId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Institucion contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in grupo.id_institucion.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const groupInstitutionId = /^\d{1,10}$/;

// NOTE: 'jornada' (ENUM('DIURNA','NOCTURNA')) and 'estado_grupo'
// (ENUM('ACTIVO','INACTIVO')) are not covered by regular expressions
// here. Enumerated values are validated at the schema layer with
// Joi.valid(...) instead, since a fixed list of allowed values is
// better expressed as an explicit whitelist than as a character pattern.

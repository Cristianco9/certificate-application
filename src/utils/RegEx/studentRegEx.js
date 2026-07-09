// The pattern ensures the student's first name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (a single given name),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in estudiante.primer_nombre_estudiante
export const studentFirstName = /^[\p{L}]{3,50}$/u;

// The pattern ensures the student's second first name, when provided,
// contains only letters (both uppercase and lowercase, including
// Spanish accented characters and 'ñ', via the Unicode letter
// category \p{L}), with no spaces (a single given name), and is
// between 3 to 50 characters long. This field is OPTIONAL: an empty
// string is also accepted, since not every student has a second given
// name, matching the VARCHAR(50) column size defined in
// estudiante.segundo_nombre_estudiante
export const studentMiddleName = /^([\p{L}]{3,50})?$/u;

// The pattern ensures the student's first last name contains only
// letters (both uppercase and lowercase, including Spanish accented
// characters and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (a single surname),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in estudiante.primer_apellido_estudiante
export const studentFirstLastName = /^[\p{L}]{3,50}$/u;

// The pattern ensures the student's second lastname, when provided,
// contains only letters (both uppercase and lowercase, including
// Spanish accented characters and 'ñ', via the Unicode letter
// category \p{L}), with no spaces (a single given name), and is
// between 3 to 50 characters long. This field is OPTIONAL: an empty
// string is also accepted, since not every student has a second given
// lastname, matching the VARCHAR(50) column size defined in
// estudiante.segundo_apellido_estudiante
export const studentSecondLastName = /^([\p{L}]{3,50})?$/u;

// The pattern ensures the student document number accepts either:
// - a purely numeric Colombian national ID (cédula/tarjeta de identidad),
//   6 to 10 digits, or
// - an alphanumeric foreign document such as a passport (6 to 20
//   characters, letters and digits only, no spaces or symbols)
// matching the VARCHAR(20) column size defined in
// estudiante.identificacion_estudiante.
// This field is nullable at the database level (historical students
// prior to year 2000 may lack a registered document), so the schema
// layer (Joi) is responsible for allowing an empty value where applicable.
export const studentDocumentNumber = /^(\d{6,10}|[a-zA-Z0-9]{6,20})$/;

// The pattern ensures the student home address contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// digits, spaces, and the symbols (# - ,) commonly used in Colombian
// address formats (e.g. 'Calle 15 #23-45 Barrio Centro'),
// and is between 5 to 120 characters long, matching the
// VARCHAR(120) column size defined in estudiante.direccion_estudiante.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const studentAddress = /^[\p{L}\d #,-]{5,120}$/u;

// The pattern ensures the student email contains only letters
// (both uppercase and lowercase),
// numbers (between 0 and 9),
// special characters as (._%+-),
// and email domain *@*.*, matching the
// VARCHAR(254) column size defined in estudiante.email_estudiante.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const studentEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;

// The pattern ensures the student id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in estudiante.id_estudiante
export const studentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Municipio contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in estudiante.id_municipio_estudiante
export const studentMunicipalityId = /^\d{1,10}$/;

// The pattern ensures the foreign key to TipoDocumento contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in estudiante.id_tipo_documento_estudiante
export const studentDocumentTypeId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Genero contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in estudiante.id_genero_estudiante
export const studentGenderId = /^\d{1,10}$/;

// The pattern ensures the student's birth date follows the ISO 8601
// date format (YYYY-MM-DD, matching Sequelize's DATEONLY
// serialization), with the year restricted to the range 1900-2099,
// the month restricted to 01-12, and the day restricted to 01-31.
// IMPORTANT LIMITATION: a regular expression can only validate the
// FORMAT and numeric ranges of a date, not whether it is a real
// calendar date. This pattern will incorrectly accept impossible
// dates such as '2024-02-30' or '2024-06-31'. For full calendar
// correctness, this pattern must be combined with Joi.date() at the
// schema layer (e.g. Joi.date().min('1900-01-01').max('2099-12-31')),
// which validates real calendar dates natively.
// Matches the DATEONLY column defined in
// estudiante.fecha_nacimiento_estudiante
export const studentBirthDate = /^(19\d{2}|20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

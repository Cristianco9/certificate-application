// The pattern ensures the student's first name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (a single given name),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in estudiante.nombre1_estudiante
export const studentFirstName1 = /^[\p{L}]{3,50}$/u;

// The pattern ensures the student's second first name contains only
// letters (both uppercase and lowercase, including Spanish accented
// characters and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (a single given name),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in estudiante.nombre2_estudiante
export const studentFirstName2 = /^[\p{L}]{3,50}$/u;

// The pattern ensures the student's first last name contains only
// letters (both uppercase and lowercase, including Spanish accented
// characters and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (a single surname),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in estudiante.apellidos1_estudiante
export const studentLastName1 = /^[\p{L}]{3,50}$/u;

// The pattern ensures the student's second last name contains only
// letters (both uppercase and lowercase, including Spanish accented
// characters and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (a single surname),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in estudiante.apellidos2_estudiante
export const studentLastName2 = /^[\p{L}]{3,50}$/u;

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

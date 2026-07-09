// The pattern ensures the user first name(s) contain only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow compound first names such as 'Juan Carlos'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in usuario.nombres_usuario
export const userFirstName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the user last name(s) contain only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow compound last names such as 'García López'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in usuario.apellidos_usuario
export const userLastName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the user document number accepts either:
// - a purely numeric Colombian national ID (cédula), 6 to 10 digits, or
// - an alphanumeric foreign document such as a passport (6 to 20
//   characters, letters and digits only, no spaces or symbols)
// matching the VARCHAR(20) column size defined in
// usuario.identificacion_usuario
export const userDocumentNumber = /^(\d{6,10}|[a-zA-Z0-9]{6,20})$/;

// The pattern ensures the user email contains only letters
// (both uppercase and lowercase),
// numbers (between 0 and 9),
// special characters as (._%+-),
// and email domain *@*.*, matching the
// VARCHAR(254) column size defined in usuario.email_usuario
export const userEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;

// The pattern validates the plain-text password entered by the user in
// the form, BEFORE it is hashed with bcrypt for storage in
// usuario.password_usuario (VARCHAR(255), which holds the resulting hash,
// not the original value this pattern checks).
// The pattern ensures the password contains at least one letter
// (both uppercase and lowercase) and at least one digit,
// and is between 8 to 80 characters long
export const userPassword = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,80}$/;

// The pattern ensures the user id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in usuario.id_usuario
export const userId = /^\d{1,10}$/;

// The pattern ensures the foreign key to TipoDocumento contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in usuario.id_tipodocumento_usuario
export const userDocumentTypeId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Municipio contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in usuario.id_municipio_usuario
export const userMunicipalityId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Rol contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in usuario.id_rol_usuario
export const userRoleId = /^\d{1,10}$/;

// The pattern ensures the foreign key to NivelAcademico contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in usuario.id_nivel_academico
export const userAcademicLevelId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Genero contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in usuario.id_genero
export const userGenderId = /^\d{1,10}$/;

// The pattern ensures the subject name contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}) and spaces
// (to allow multi-word subjects such as 'Educación Física'),
// and is between 3 to 20 characters long, matching the
// VARCHAR(20) column size defined in asignatura.nombre_asignatura
export const subjectName = /^[\p{L} ]{3,20}$/u;

// The pattern ensures the subject description contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// digits, spaces, and basic punctuation (. , -) to allow a short
// grammatically correct sentence,
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in asignatura.descripcion_asignatura
export const subjectDescription = /^[\p{L}\d .,-]{3,50}$/u;

// The pattern ensures the weekly hourly intensity contains only a
// single digit from 1 to 9 (no leading zeros, no values outside this
// range), matching the SMALLINT column defined in
// asignatura.intensidad_horaria
export const subjectHourlyIntensity = /^[1-9]$/;

// The pattern ensures the subject id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in asignatura.id_asignatura
export const subjectId = /^\d{1,10}$/;

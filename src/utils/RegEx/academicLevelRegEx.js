// The pattern ensures the academic level name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow multi-word levels such as 'Básica Primaria'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in nivel_academico.nombre_nivel_academico
export const academicLevelName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the academic level abbreviation contains only
// uppercase letters (including Spanish accented characters and 'ñ',
// via the Unicode letter category \p{L}), no spaces or digits,
// and is between 2 to 10 characters long, matching the
// VARCHAR(10) column size defined in nivel_academico.abreviatura_nivel_academico
export const academicLevelAbbreviation = /^[\p{L}]{2,10}$/u;

// The pattern ensures the academic level id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in nivel_academico.id_nivel_academico
export const academicLevelId = /^\d{1,10}$/;

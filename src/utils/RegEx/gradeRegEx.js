// The pattern ensures the grade name matches exactly one of the 11
// fixed values used by the institution: 'Primero', 'Segundo',
// 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo',
// 'Noveno', 'Décimo', 'Undécimo'. Unlike a character-range pattern,
// this is an exact literal alternation, since the field represents a
// closed set of academic grade levels rather than free-form text.
// Matches the VARCHAR(50) column size defined in grado.nombre_grado
export const gradeName = /^(Primero|Segundo|Tercero|Cuarto|Quinto|Sexto|Séptimo|Octavo|Noveno|Décimo|Undécimo)$/;

// The pattern ensures the grade description contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// digits, spaces, and basic punctuation (. , -) to allow a short
// grammatically correct sentence,
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in grado.descripcion_grado
export const gradeDescription = /^[\p{L}\d .,-]{3,50}$/u;

// The pattern ensures the grade id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in grado.id_grado
export const gradeId = /^\d{1,10}$/;

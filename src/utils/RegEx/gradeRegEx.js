// The pattern ensures the grade name contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}), digits, and spaces
// (to allow values such as 'Primero', 'Décimo' or 'Grado 11'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in grado.nombre_grado
export const gradeName = /^[\p{L}\d ]{3,50}$/u;

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

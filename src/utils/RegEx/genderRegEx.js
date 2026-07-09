// The pattern ensures the gender name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// with no spaces (single-word values such as 'Masculino' or 'Femenino'),
// and is between 3 to 20 characters long, matching the
// VARCHAR(20) column size defined in genero.nombre_genero
export const genderName = /^[\p{L}]{3,20}$/u;

// The pattern ensures the gender id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in genero.id_genero
export const genderId = /^\d{1,10}$/;

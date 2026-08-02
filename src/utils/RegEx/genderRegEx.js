// The pattern ensures the gender name contains only Unicode letters
// (including accented characters and 'ñ') and single spaces between words.
// It does not allow leading/trailing spaces or multiple consecutive spaces.
// The total length must be between 3 and 20 characters, matching the
// VARCHAR(20) column size defined in genero.nombre_genero.
export const genderName = /^(?=.{3,20}$)\p{L}+(?: \p{L}+)*$/u;

// The pattern ensures the gender id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in genero.id_genero
export const genderId = /^\d{1,10}$/;

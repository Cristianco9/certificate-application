// The pattern ensures the role name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow multi-word roles such as 'Secretario Académico'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in rol.nombre_rol
export const roleName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the role description contains letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// digits, spaces, and basic punctuation (. , -) to allow a short
// grammatically correct sentence,
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in rol.descripcion_rol
export const roleDescription = /^[\p{L}\d .,-]{3,50}$/u;

// The pattern ensures the role id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in rol.id_rol
export const roleId = /^\d{1,10}$/;

// The pattern ensures the department name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow multi-word departments such as 'Valle del Cauca'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in departamento.nombre_departamento
export const departmentName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the department id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in departamento.id_departamento
export const departmentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Pais contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in departamento.id_pais
export const departmentCountryId = /^\d{1,10}$/;


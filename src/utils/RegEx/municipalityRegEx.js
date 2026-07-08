// The pattern ensures the municipality name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow multi-word municipalities such as 'Roldanillo' or
// 'La Unión'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in municipio.nombre_municipio
export const municipalityName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the municipality id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in municipio.id_municipio
export const municipalityId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Departamento contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in municipio.id_departamento
export const municipalityDepartmentId = /^\d{1,10}$/;

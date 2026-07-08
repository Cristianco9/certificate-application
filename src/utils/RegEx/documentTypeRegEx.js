// The pattern ensures the document type name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow multi-word values such as 'Cédula de Ciudadanía' or
// 'Tarjeta de Identidad'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in tipo_documento.nombre_tipodocumento
export const documentTypeName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the document type id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in tipo_documento.id_tipo_documento
export const documentTypeId = /^\d{1,10}$/;

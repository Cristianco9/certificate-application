// The pattern ensures the country name contains only letters
// (both uppercase and lowercase, including Spanish accented characters
// and 'ñ', via the Unicode letter category \p{L}),
// spaces (to allow multi-word countries such as 'Costa Rica'),
// and is between 3 to 50 characters long, matching the
// VARCHAR(50) column size defined in pais.nombre_pais
export const countryName = /^[\p{L} ]{3,50}$/u;

// The pattern ensures the ISO 3166-1 alpha-2 country code contains
// exactly 2 letters (A-Z only, per the ISO 3166 standard, which does
// not use accented characters), matching the VARCHAR(2) column size
// defined in pais.codigo_iso2. Both cases are accepted here — this
// schema validates SHAPE only ('is it 2 letters'), not final casing;
// CountryServices.formatIso2Code trims and uppercases the value before
// it is persisted, so rejecting lowercase input at the validation layer
// would make that normalization step unreachable for the most common
// case (a frontend text input without a forced uppercase transform).
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const countryIso2Code = /^[A-Za-z]{2}$/;

// The pattern ensures the country id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in pais.id_pais
export const countryId = /^\d{1,10}$/;

// The pattern ensures the phone number accepts either:
// - a Colombian mobile number: exactly 10 digits, starting with 3
//   (e.g. 3001234567), or
// - a landline number: 7 to 10 digits, with an optional '+57' country
//   code prefix (e.g. 6032345678 or +576032345678)
// matching the VARCHAR(20) column size defined in
// telefono.numero_telefono
export const phoneNumber = /^(3\d{9}|(\+57)?\d{7,10})$/;

// The pattern ensures the phone id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in telefono.id_telefono
export const phoneId = /^\d{1,10}$/;

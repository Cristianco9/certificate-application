// The pattern ensures the user-phone bridge id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary
// key defined in usuario_telefono.id_usuario_telefono
export const userPhoneId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Usuario contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in usuario_telefono.id_usuario
export const userPhoneUserId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Telefono contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in usuario_telefono.id_telefono
export const userPhonePhoneId = /^\d{1,10}$/;

// The pattern ensures the institution-phone bridge id contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// primary key defined in
// institucion_telefono.id_institucion_telefono
export const institutionPhoneId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Institucion contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in institucion_telefono.id_institucion
export const institutionPhoneInstitutionId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Telefono contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in institucion_telefono.id_telefono
export const institutionPhonePhoneId = /^\d{1,10}$/;

// The pattern ensures the certificate-recipient-phone bridge id
// contains only numbers and is between 1 to 10 digits long, matching
// the INTEGER primary key defined in
// receptor_certificado_telefono.id_receptor_certificado_telefono
export const certificateRecipientPhoneId = /^\d{1,10}$/;

// The pattern ensures the foreign key to ReceptorCertificado contains
// only numbers and is between 1 to 10 digits long, matching the
// INTEGER foreign key defined in
// receptor_certificado_telefono.id_receptor_certificado
export const certificateRecipientPhoneRecipientId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Telefono contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in receptor_certificado_telefono.id_telefono
export const certificateRecipientPhonePhoneId = /^\d{1,10}$/;

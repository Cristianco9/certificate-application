// The pattern ensures the certificate signature id contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// primary key defined in
// firma_certificado.id_firma_firmacertificado
export const certificateSignatureId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Usuario (the signer) contains
// only numbers and is between 1 to 10 digits long, matching the
// INTEGER foreign key defined in
// firma_certificado.id_usuario_firmacertificado
export const certificateSignatureUserId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Certificado contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in
// firma_certificado.id_certificado_firmacertificado
export const certificateSignatureCertificateId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Municipio contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in firma_certificado.id_municipio
export const certificateSignatureMunicipalityId = /^\d{1,10}$/;

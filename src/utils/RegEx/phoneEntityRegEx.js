// The pattern ensures the phone-entity link id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in telefono_entidad.id_telefono_entidad
export const phoneEntityId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Telefono contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in telefono_entidad.id_telefono
export const phoneEntityPhoneId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Usuario contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in telefono_entidad.id_usuario_telefonoentidad.
// This field is nullable at the database level (only populated when
// the phone belongs to a user), so the schema layer (Joi) is
// responsible for allowing an empty value where applicable.
export const phoneEntityUserId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Estudiante contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in
// telefono_entidad.id_estudiante_telefonoentidad.
// This field is nullable at the database level (only populated when
// the phone belongs to a student), so the schema layer (Joi) is
// responsible for allowing an empty value where applicable.
export const phoneEntityStudentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to ReceptorCertificado contains
// only numbers and is between 1 to 10 digits long, matching the
// INTEGER foreign key defined in
// telefono_entidad.id_receptorcertificado_telefonoentidad.
// This field is nullable at the database level (only populated when
// the phone belongs to a certificate recipient), so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const phoneEntityCertificateRecipientId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Institucion contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in
// telefono_entidad.id_institucion_telefonoentidad.
// This field is nullable at the database level (only populated when
// the phone belongs to an institution), so the schema layer (Joi) is
// responsible for allowing an empty value where applicable.
export const phoneEntityInstitutionId = /^\d{1,10}$/;

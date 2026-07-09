// The pattern ensures the enrollment id contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER primary key
// defined in matricula.id_matricula
export const enrollmentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Estudiante contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in matricula.id_estudiante_matricula.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const enrollmentStudentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Grupo contains only numbers
// and is between 1 to 10 digits long, matching the INTEGER foreign key
// defined in matricula.id_grupo_matricula.
// This field is nullable at the database level, so the schema layer
// (Joi) is responsible for allowing an empty value where applicable.
export const enrollmentGroupId = /^\d{1,10}$/;

// NOTE: 'fecha_matricula' (DATE) is not covered by a regular expression
// here. Date values are validated at the schema layer with Joi.date()
// instead, which offers native range and format validation more
// appropriate than a text-based pattern.

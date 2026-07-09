// The pattern ensures the student-phone bridge id contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// primary key defined in
// estudiante_telefono.id_estudiante_telefono
export const studentPhoneId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Estudiante contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in estudiante_telefono.id_estudiante
export const studentPhoneStudentId = /^\d{1,10}$/;

// The pattern ensures the foreign key to Telefono contains only
// numbers and is between 1 to 10 digits long, matching the INTEGER
// foreign key defined in estudiante_telefono.id_telefono
export const studentPhonePhoneId = /^\d{1,10}$/;

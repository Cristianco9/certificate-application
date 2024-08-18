// Regex pattern to validate the first name of a student

// The pattern ensures the first name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 10 characters long
export const studentFirstName = /^[\p{L}]{3,10}$/u;

// Regex pattern to validate the second name of a student
// The pattern ensures the second name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 10 characters long
export const studentSecondName = /^[\p{L}]{3,10}$/u;

// Regex pattern to validate the first last name of a student
// The pattern ensures the first last name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 10 characters long
export const studentFirstLastName = /^[\p{L}]{3,10}$/u;

// Regex pattern to validate the second last name of a student
// The pattern ensures the second last name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 10 characters long
export const studentSecondLastName = /^[\p{L}]{3,10}$/u;

// Regex pattern to validate the student ID
// The pattern ensures the student ID contains exactly 10 digits
export const studentID = /^[0-9]{10}$/;

// Regex pattern to validate the first name of a student

// The pattern ensures the first name contains only letters
// (both uppercase and lowercase)
// and is between 2 to 10 characters long
export const studentFirstName = /^[a-zA-Z]{2,10}$/;

// Regex pattern to validate the second name of a student
// The pattern ensures the second name contains only letters
// (both uppercase and lowercase)
// and is between 2 to 10 characters long
export const studentSecondName = /^[a-zA-Z]{2,10}$/;

// Regex pattern to validate the first last name of a student
// The pattern ensures the first last name contains only letters
// (both uppercase and lowercase)
// and is between 2 to 10 characters long
export const studentFirstLastName = /^[a-zA-Z]{2,10}$/;

// Regex pattern to validate the second last name of a student
// The pattern ensures the second last name contains only letters
// (both uppercase and lowercase)
// and is between 2 to 10 characters long
export const studentSecondLastName = /^[a-zA-Z]{2,10}$/;

// Regex pattern to validate the student ID
// The pattern ensures the student ID contains exactly 10 digits
export const studentID = /^[0-9]{10}$/;

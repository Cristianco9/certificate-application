// The pattern ensures the username contains only letters
// (both uppercase and lowercase)
// and is between 3 to 10 characters long
export const readerUsername = /^[\p{L}]{3,10}$/u;

// Regex pattern to validate the user password
// The pattern ensures the password contains
// letters (both uppercase and lowercase), numbers, and characters
// and is between 5 to 30 characters long
export const readerPassword = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{5,30}$/;

// Regex pattern to validate the user id
// The pattern ensures the unique identifier contains only umbers
// and is between 1 to 10 digits long
export const readerId = /^\d{1,10}$/

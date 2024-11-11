// The pattern ensures the first name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 20 characters long
export const firstName = /^[\p{L}]{3,20}$/u;

// The pattern ensures the middle name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 20 characters long
export const middleName = /^[\p{L}]{3,20}$/u;

// The pattern ensures the first last name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 20 characters long
export const firstLastName = /^[\p{L}]{3,20}$/u;

// The pattern ensures the second last name contains only letters
// (both uppercase and lowercase)
// and is between 3 to 20 characters long
export const secondLastName = /^[\p{L}]{3,20}$/u;

// The pattern ensures the username contains only letters
// (both uppercase and lowercase),
// numbers (between 0 and 9),
// special characters as (. - _),
// and is between 3 to 20 characters long
export const username = /^[a-zA-Z0-9._-]{3,20}$/;

// Regex pattern to validate the user password
// The pattern ensures the password contains
// letters (both uppercase and lowercase), numbers, and characters
// and is between 5 to 30 characters long
export const password = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{5,30}$/;

// The pattern ensures the user email contains only letters
// (both uppercase and lowercase),
// numbers (between 0 and 9),
// special characters as (._%+-),
// and email domain *@*.*
export const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;

// Regex pattern to validate the user id
// The pattern ensures the unique identifier contains only umbers
// and is between 1 to 10 digits long
export const ID = /^\d{1,10}|1000000$/

// Regex pattern to validate the user authentication token
// The pattern ensures the token contains
// letters (both uppercase and lowercase), numbers, and characters
// and is between 30 to 65 characters long
export const userAuthToken = /^[A-Za-z0-9_-]{30,160}\.[A-Za-z0-9_-]{30,160}\.[A-Za-z0-9_-]{30,160}$/;

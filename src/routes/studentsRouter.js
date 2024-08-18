// Import the Router class from Express
import { Router } from "express";
// Import the middleware to verify tokens from the authentication app
import { authAppVerifyToken } from
'../middlewares/tokenHandlers/authAppTokenHandler.js';
// Import the middleware to verify the API key from the client app
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
// Import the controller function to authenticate students
import { authenticateStudent } from '../controllers/students/authenticate.js';

// Create a new Router instance
export const studentsRouter = Router();

// Define a POST route for student authentication
studentsRouter.post(
  // Route path to authenticate a student fingerprint id
  '/auth',
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
   // Controller function to authenticate the student
  authenticateStudent
);


// Import the Router class from Express
import { Router } from "express";
// Import the middleware to verify tokens from the authentication app
import { authAPPVerifyToken } from
'../middlewares/tokenHandlers/authAppTokenHandler.js';
// Import the controller function to authenticate students
import { authenticateStudent } from '../controllers/students/authenticate.js';

// Create a new Router instance
const router = Router();

// Define a POST route for student authentication
router.post(
  // Route path with a parameter for student fingerprint id as a token (jwt)
  '/auth/:jwt',
  // Middleware to verify the token before proceeding to the controller
  authAPPVerifyToken,
   // Controller function to authenticate the student
  authenticateStudent
);

// Export the router instance for use in other parts of the application
export default router;

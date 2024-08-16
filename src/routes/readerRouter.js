// Import the Router class from Express
import { Router } from "express";
// Import the middleware to verify tokens from the authentication app
import { authAppVerifyToken } from
'../middlewares/tokenHandlers/authAppTokenHandler.js';
// Import the middleware to verify the API key from the client app
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
// Import the controller function to authenticate login readers
import { loginReader } from '../controllers/readers/login.js';

// Create a new Router instance
const router = Router();

// Define a POST route for readers authentication
router.post(
  // Route path to authenticate a reader users
  '/auth',
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
   // Controller function to login the reader
  loginReader
);

// Export the router instance for use in other parts of the application
export default router;

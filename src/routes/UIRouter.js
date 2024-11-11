// Import the Router class from Express
import { Router } from "express";
// Import the middleware to verify tokens from the authentication app
import { authAppVerifyToken } from
'../middlewares/tokenHandlers/authAppTokenHandler.js';
// Import the middleware to verify the API key from the client app
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
// Import the middleware to verify the data types sended in the request
import { validatorHandler  } from '../middlewares/validatorHandler.js';
// Import the controllers functions to manage user interfaces templates
import { loginForm } from '../controllers/UI/loginForm.js';

// Create a new Router instance
export const UIRouter = Router();

// Define a GET route for login view
UIRouter.get(
  // Route path display the login view
  '/',
  // Middleware to validate the data type
  //validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Controller function to render a login template
  loginForm
);

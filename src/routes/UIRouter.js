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
import { dashboard } from '../controllers/UI/dashboard.js';
import { certificateAcademicForm } from '../controllers/UI/certificateAcademicForm.js';

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

// Define a GET route for dashboard view
UIRouter.get(
  // Route path display the dashboard view
  '/dashboard',
  // Middleware to validate the data type
  //validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to render a dashboard template
  dashboard
);

// Define a GET route for certificate academic form view
UIRouter.get(
  // Route path display the certificate academic form view
  '/certificates/academic',
  // Middleware to validate the data type
  //validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to render a dashboard template
  certificateAcademicForm
);

// Import the Router class from Express
import { Router } from "express";
// Import the middleware to verify tokens from the authentication app
import { authAppVerifyToken } from
'../middlewares/tokenHandlers/authAppTokenHandler.js';
// Import the middleware to verify the API key from the client app
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
// Import the middleware to verify the data types sended in the request
import { validatorHandler  } from '../middlewares/validatorHandler.js';
// Import the user data types schema
import { userSchema } from '../schemas/userSchema.js';
// Import the controllers functions to authenticate and manage users
import { loginUser } from '../controllers/users/login.js';
import { createOneUser } from '../controllers/users/create.js';
import { deleteOneUser } from '../controllers/users/delete.js';
import { updateOneUser } from '../controllers/users/update.js';
import { listOneUser } from '../controllers/users/listOne.js';
import { listAllUsers } from '../controllers/users/listAll.js';

// Create a new Router instance
export const userRouter = Router();

// Define a POST route for users authentication
userRouter.post(
  // Route path to authenticate a users
  '/login',
  // Middleware to validate the data type
  validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Controller function to login a user
  loginUser
);

// Define a POST route for create an user
userRouter.post(
  // Route path to create a user
  '/create',
  // Middleware to validate the data type
  validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to create the user
  createOneUser
);

// Define a POST route to update an user
userRouter.post(
  // Route path to update a user
  '/update',
  // Middleware to validate the data type
  validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to update the reader
  updateOneUser
);

// Define a POST route to delete an user
userRouter.post(
  // Route path to delete a user
  '/delete',
  // Middleware to validate the data type
  validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to delete the user
  deleteOneUser
);

// Define a POST route to list an user
userRouter.post(
  // Route path to list an user
  '/listone',
  // Middleware to validate the data type
  validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to list a user
  listOneUser
);

// Define a GET route to list all users
userRouter.get(
  // Route path to list all users
  '/listall',
  // Middleware to validate the data type
  //validatorHandler(userSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  //checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to list all users
  listAllUsers
);

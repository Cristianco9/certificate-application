// Import the Router class from Express
import { Router } from "express";
// Import the middleware to verify tokens from the authentication app
import { authAppVerifyToken } from
'../middlewares/tokenHandlers/authAppTokenHandler.js';
// Import the middleware to verify the API key from the client app
import { checkApiKey } from '../middlewares/apiAuthHandler.js';
import { validatorHandler  } from '../middlewares/validatorHandler.js';
import { readerSchema } from '../schemas/readerSchema.js';
// Import the controllers functions to authenticate and manage readers
import { loginReader } from '../controllers/readers/login.js';
import { createOneReader } from '../controllers/readers/create.js';
import { deleteOneReader } from '../controllers/readers/delete.js';
import { updateOneReader } from '../controllers/readers/update.js';
import { listOneReader } from '../controllers/readers/listOne.js';
import { listAllReader } from '../controllers/readers/listAll.js';

// Create a new Router instance
export const readerRouter = Router();

// Define a POST route for readers authentication

readerRouter.post(
  // Route path to authenticate a reader users
  '/login',
  // Middleware to validate the data type
  validatorHandler(readerSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
   // Controller function to login a user
  loginReader
);

readerRouter.post(
  // Route path to create a reader user
  '/create',
  // Middleware to validate the data type
  validatorHandler(readerSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to create the reader
  createOneReader
);

readerRouter.post(
  // Route path to update a reader user
  '/update',
  // Middleware to validate the data type
  validatorHandler(readerSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to update the reader
  updateOneReader
);

readerRouter.post(
  // Route path to delete a reader user
  '/delete',
  // Middleware to validate the data type
  validatorHandler(readerSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to delete the reader
  deleteOneReader
);

readerRouter.post(
  // Route path to list a reader user
  '/listone',
  // Middleware to validate the data type
  validatorHandler(readerSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to list a reader
  listOneReader
);

readerRouter.get(
  // Route path to list all reader users
  '/listall',
  // Middleware to validate the data type
  validatorHandler(readerSchema, 'body'),
  // Middleware to verify the API key sended by the client before
  // proceeding to the controller
  checkApiKey,
  // Middleware to verify the token before proceeding to the controller
  authAppVerifyToken,
  // Controller function to list all readers
  listAllReader
);

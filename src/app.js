// Import necessary modules and dependencies
// Express framework for creating the app
import express from 'express';
// Middleware for logging HTTP requests
import morgan from 'morgan';
// Function to test database connection
import { testConnection } from './libraries/DBConnection.js';
// Middleware to enable Cross-Origin Resource Sharing
import cors from 'cors';
// Middleware to parse cookies
import cookieParser from 'cookie-parser';
// Import the IP address and port from the network configuration file
import { theIPAddress, port } from './libraries/netConfig.js';
// Environment variables configuration file
import { config } from "../config/config.js";
// Main router for the API
import routerApi from './routes/indexRouter.js';
// Custom error handling middlewares
import {
    logError,
    errorHandler,
    boomErrorHandler,
    ORMErrorHandler
} from "./middlewares/errorHandler.js";

// Create the app with Express
const app = express();

// Use middlewares
// HTTP request logger middleware
app.use(morgan('dev'));
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: false }));
// Middleware to parse JSON data
app.use(express.json());
// Middleware to parse cookies
app.use(cookieParser());

// Immediately Invoked Function Expression (IIFE) to run the server
(async () => {
  // Await the app to start listening on the specified IP address and port
  const createApp = await app.listen(port, theIPAddress, (req, res) => {
    // Log the server start information to the console
    console.log(`server on port https://${theIPAddress}:${port}`);
  });
})();

// Test database connection
// Call the function to ensure the database connection is working
testConnection();

// Initialize the main router
// Set up API routes
routerApi(app);

// Set up CORS options
// List of allowed origins
const whiteList = ['http://127.0.0.1:3000'];
const options = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin) || !origin) {
      // Allow request if origin is in the whitelist or if there is no origin
      // (e.g., mobile apps)
      callback(null, true);
    } else {
      // Block request if origin is not in the whitelist
      callback(new Error('Not allowed'));
    }
  }
}
// Enable CORS with the specified options
app.use(cors());

// Import passport authentication setup
// Dynamic import of authentication module
const passport = import('./utils/auth/indexAuth.js');

// Use custom error handling middlewares
// Middleware for logging errors
app.use(logError);
// Middleware for handling ORM errors
app.use(ORMErrorHandler);
// Middleware for handling Boom errors
app.use(boomErrorHandler);
// General error handling middleware
app.use(errorHandler);

// Export the app for use in other files
export default app;

// Import necessary modules and dependencies
// Express framework for creating the app
import express from 'express';
// function to manage files and directories since the node.js app
import path from 'path';
// function to have access to the directory or file path
import { fileURLToPath } from 'url';
// Middleware to handle body request
import bodyParser from 'body-parser';
// Middleware to handle cookies
import cookieParser from 'cookie-parser';
// Middleware for logging HTTP requests
import morgan from 'morgan';
// Function to test database connection
import { testConnection } from './libraries/DBConnection.js';
// Import the IP address and port from the network configuration file
import { theIPAddress, port } from './libraries/netConfig.js';
// Main router for the API
import routerApi from './routes/index.js';
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
// Middleware for parsing JSON bodies
app.use(bodyParser.json());
// Middleware for handle cookies
app.use(cookieParser());

// Static files path
// Store in the constant the project dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Define the path to static files a throw the src/public/ path
app.use(express.static(path.join(__dirname, 'public')));

// Views engine
// Define the access path to the HTML view templates
app.set('views', path.join(__dirname, 'views'));
// Define the HTML templates engine, and the templates file extension
app.set('view engine', 'ejs');

// Immediately Invoked Function Expression (IIFE) to run the server
(async () => {
  // Await the app to start listening on the specified IP address and port
  const createApp = await app.listen(port, theIPAddress, (req, res) => {
    // Log the server start information to the console
    console.log(`server on port http://${theIPAddress}:${port}`);
  });
})();

// Test database connection
// Call the function to ensure the database connection is working
testConnection();

// Initialize the main router
// Set up API routes
routerApi(app);

// Import passport authentication setup
// Dynamic import of authentication module
const passport = import('./utils/auth/index.js');

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

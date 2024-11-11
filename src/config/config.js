// Import dotenv package to load environment variables from a .env file
import dotenv from "dotenv";

// Load environment variables from .env file into process.env
dotenv.config();

// Export the configuration object containing various application settings
export const config = {

  // Set the environment (default to 'dev' if not specified)
  env: process.env.NODE_ENV || 'dev',

  // Database dialect
  dialect: process.env.DIALECT,

  // Application port (default to 3030 if not specified)
  appPort: process.env.APP_PORT || 3030,

  // Database user name from environment variables
  dbUser: process.env.DB_USER,

  // Database root user name from environment variables
  dbRootUser: process.env.DB_ROOT_USER,

  // Database root password from environment variables
  dbRootPassword: process.env.DB_ROOT_PASSWORD,

  // Database user password from environment variables
  dbUserPassword: process.env.DB_USER_PASSWORD,

  // Database host from environment variables
  dbHost: process.env.DB_HOST,

  // Database name from environment variables
  dbName: process.env.DB_NAME,

  // Database port from environment variables
  dbPort: process.env.DB_PORT,

  // API key from environment variables
  APIKey: process.env.API_KEY,

  // JWT secret key for the authentication application
  authAppJwtKey: process.env.AUTH_APP_JWT_SECRET_KEY,

};

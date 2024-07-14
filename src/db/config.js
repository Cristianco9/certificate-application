// Import configuration settings
import { config } from "../config/config.js";

// Encode the database user and password to handle special characters
const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbUserPassword);

// Construct and export the database connection URI
export const URI =
  `
  mysql://${USER}:${PASSWORD}@
  ${config.dbHost}:${config.dbPort}/${config.dbName}
  `;

// Define and export the database configuration object for different environments
export const databaseConfig = {
  // Configuration for development environment
  development: {
    // Use the constructed URI for connection
    url: URI,
    // Specify the dialect as MySQL
    dialect: 'mysql',
  },

  // Configuration for production environment
  production: {
    // Use the same URI for production
    url: URI,
    // Specify the dialect as MySQL
    dialect: 'mysql',
  }
};

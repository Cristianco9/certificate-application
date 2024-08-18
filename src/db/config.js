// Import configuration settings
import { config } from "../config/config.js";

// Define and export the database configuration object for different environments
const databaseConfig = {

  // Configuration for development environment
  development: {
    username: config.dbRootUser,
    password: config.dbRootPassword,
    database: config.dbName,
    host: config.dbHost,
    port: config.dbPort,
    dialect: config.dialect || 'mysql',
  },

  // Configuration for production environment
  production: {
    username: config.dbRootUser,
    password: config.dbRootPassword,
    database: config.dbName,
    host: config.dbHost,
    port: config.dbPort,
    dialect: config.dialect || 'mysql',
  }
};

export default databaseConfig;

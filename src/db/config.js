// Import the centralized application configuration, which resolves all
// environment variables (credentials, host, port, dialect, etc.)
import { config } from "../config/config.js";

/**
 * Sequelize database configuration object.
 *
 * Defines connection settings per environment (development, production).
 * All values are sourced from environment variables via the `config` module
 * rather than hardcoded here, so credentials never live in source control.
 *
 */
const databaseConfig = {
  // Configuration used when NODE_ENV=development
  development: {
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    host: config.dbHost,
    port: config.dbPort,
    dialect: config.dialect,
  },

  // Configuration used when NODE_ENV=production
  // Kept structurally identical to development; environment variables
  // are expected to differ per deployment target (e.g., managed DB host).
  production: {
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    host: config.dbHost,
    port: config.dbPort,
    dialect: config.dialect,
  }
};

// Exported as the single source of truth for Sequelize CLI and model
// initialization across the application.
export default databaseConfig;

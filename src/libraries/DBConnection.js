// Import the Sequelize constructor from the 'sequelize' library
import { Sequelize } from 'sequelize';
// Import the database URI from the configuration file
import { URI } from '../db/config.js';

// Create a new instance of Sequelize with the provided URI and options
export const sequelize = new Sequelize(URI, {
  // Specify the dialect as MySQL
  dialect: 'mysql',
  // Enable logging of SQL queries to the console
  logging: console.log,
});

/**
 * Function to test the database connection
 * @param {Function} next
 * - Optional callback function to execute after the test
 */
export const testConnection = async (next) => {
  try {
    // Attempt to authenticate the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (err) {
    // Log an error message if the connection fails
    console.log('Impossible to connect the database:', err);
  }
};

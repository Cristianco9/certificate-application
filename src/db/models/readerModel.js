// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';

// Define the name of the readers table
export const READER_TABLE = 'readers';

// Define the Reader model
export const Reader = sequelize.define(READER_TABLE, {
  // Define the 'id' column as an integer
  id: {
    // Integer type with a length of 10
    type: DataTypes.INTEGER(),
    // This field cannot be null
    allowNull: false,
    // This field is the primary key
    primaryKey: true,
    // This field must be unique across all records
    unique: true
  },

  // Define the 'username' column
  username: {
    // Text type with a maximum length of 10 characters
    type: DataTypes.STRING(10),
    // This field cannot be null
    allowNull: false,
    // This field need to be unique
    unique: true,
  },

  // Define the 'password' column
  password: {
    // Text type with a maximum length of 10 characters
    type: DataTypes.STRING(30),
    // This field cannot be null
    allowNull: false,
    // This field does not need to be unique
    unique: false,
  }
}, {
  // Additional model options
  // Pass the sequelize instance
  sequelize,
  // Specify the table name
  tableName: READER_TABLE,
  // Specify the model name
  modelName: 'reader',
  // Enable automatic timestamp fields (createdAt, updatedAt)
  timestamps: true
});

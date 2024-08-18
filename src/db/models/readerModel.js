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
    type: DataTypes.INTEGER,
    // This field cannot be null
    allowNull: false,
    // This field is the primary key
    primaryKey: true,
    // This field must be unique across all records
    unique: true,
    // auto increment the users id
    autoIncrement: true,
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
    type: DataTypes.STRING(65),
    // This field cannot be null
    allowNull: false,
    // This field does not need to be unique
    unique: false,
  },

  // Define the 'createdAt' column
  createdAt: {
    // Date type for the creation timestamp
    type: DataTypes.DATE,
    // Automatically set the current timestamp when the record is created
    defaultValue: DataTypes.NOW,
    // This field cannot be null
    allowNull: false,
    // Translate the field name from camelCase to snake_case
    field: 'created_at',
  },

  // Define the 'updatedAt' column
  updatedAt: {
    // Date type for the last update timestamp
    type: DataTypes.DATE,
    // Automatically update the timestamp when the record is updated
    defaultValue: DataTypes.NOW,
    // This field cannot be null
    allowNull: false,
    // Translate the field name from camelCase to snake_case
    field: 'updated_at',
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

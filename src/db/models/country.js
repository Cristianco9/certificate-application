// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the countries table
export const COUNTRY_TABLE = 'pais';
// Define the Country model
export const Country = sequelize.define(COUNTRY_TABLE, {
  // Define the 'id' column
  id: {
    // Integer type
    type: DataTypes.INTEGER,
    // This field cannot be null
    allowNull: false,
    // Primary key
    primaryKey: true,
    // Must be unique
    unique: true,
    // Database column name
    field: 'id_pais',
  },
  // Country name
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'nombre_pais',
  },
  // ISO 3166-1 alpha-2 country code
  iso2Code: {
    type: DataTypes.STRING(2),
    allowNull: true,
    field: 'codigo_iso2',
  },
  // Creation date
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion',
  },
  // Last update date
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_modificacion',
  },
}, {
  // Pass the sequelize instance
  sequelize,
  // Specify the table name
  tableName: COUNTRY_TABLE,
  // Specify the model name
  modelName: 'country',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

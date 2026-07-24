// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the departments table
export const DEPARTMENT_TABLE = 'departamento';
// Define the Department model
export const Department = sequelize.define(DEPARTMENT_TABLE, {
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
    // Auto increment value
    autoIncrement: true,
    // Database column name
    field: 'id_departamento',
  },
  // Department name
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'nombre_departamento',
  },
  // Foreign key to Country
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_pais',
    references: {
      model: 'pais',
      key: 'id_pais',
    },
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
  tableName: DEPARTMENT_TABLE,
  // Specify the model name
  modelName: 'department',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

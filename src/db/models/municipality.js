// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the municipalities table
export const MUNICIPALITY_TABLE = 'municipio';
// Define the Municipality model
export const Municipality = sequelize.define(MUNICIPALITY_TABLE, {
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
    field: 'id_municipio',
  },
  // Municipality name
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'nombre_municipio',
  },
  // Foreign key to Department
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_departamento',
    references: {
      model: 'departamento',
      key: 'id_departamento',
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
  tableName: MUNICIPALITY_TABLE,
  // Specify the model name
  modelName: 'municipality',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the subjects table
export const SUBJECT_TABLE = 'asignatura';
// Define the Subject model
export const Subject = sequelize.define(SUBJECT_TABLE, {
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
    field: 'id_asignatura',
  },
  // Subject name
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'nombre_asignatura',
  },
  // Subject description
  description: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'descripcion_asignatura',
  },
  // Weekly hourly intensity (small integer, e.g. hours per week)
  hourlyIntensity: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    field: 'intensidad_horaria',
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
  tableName: SUBJECT_TABLE,
  // Specify the model name
  modelName: 'subject',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

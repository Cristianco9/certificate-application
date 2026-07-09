// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the academic levels table
export const ACADEMIC_LEVEL_TABLE = 'nivel_academico';
// Define the AcademicLevel model
export const AcademicLevel = sequelize.define(ACADEMIC_LEVEL_TABLE, {
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
    field: 'id_nivel_academico',
  },
  // Academic level name (e.g. 'Técnico', 'Tecnológo', 'Licenciado', 'Especialsita', 'Maestría', 'Doctorado', 'Post-Doctorado')
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'nombre_nivel_academico',
  },
  // Academic level abbreviation (e.g. 'Téc', 'Tec', 'Lic', 'Esp', 'Mgs', 'Ph.D')
  abbreviation: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    field: 'abreviatura_nivel_academico',
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
  tableName: ACADEMIC_LEVEL_TABLE,
  // Specify the model name
  modelName: 'academicLevel',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

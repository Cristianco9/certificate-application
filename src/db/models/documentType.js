// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the document types table
export const DOCUMENT_TYPE_TABLE = 'tipo_documento';
// Define the DocumentType model
export const DocumentType = sequelize.define(DOCUMENT_TYPE_TABLE, {
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
    field: 'id_tipo_documento',
  },
  // Document type name (e.g. 'Cédula de Ciudadanía', 'Tarjeta de Identidad', 'Registro Civil, 'Cédula de Extranjería, 'Pasaporte', 'Permiso Especial de Permanenciac (PEP)', 'NIT')
  name: {
    type: DataTypes.ENUM('Cédula de Ciudadanía', 'Tarjeta de Identidad', 'Registro Civil', 'Cédula de Extranjería', 'Pasaporte', 'Permiso Especial de Permanencia (PEP)', 'NIT'),
    allowNull: false,
    unique: true,
    field: 'nombre_tipodocumento',
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
  tableName: DOCUMENT_TYPE_TABLE,
  // Specify the model name
  modelName: 'documentType',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the student phones table
export const STUDENT_PHONE_TABLE = 'estudiante_telefono';
// Define the StudentPhone model. Bridge table linking a Student to one
// of their Phone records.
export const StudentPhone = sequelize.define(STUDENT_PHONE_TABLE, {
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
    field: 'id_estudiante_telefono',
  },
  // Foreign key to Student
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_estudiante',
    references: {
      model: 'estudiante',
      key: 'id_estudiante',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  // Foreign key to Phone
  phoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_telefono',
    references: {
      model: 'telefono',
      key: 'id_telefono',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  // Pass the sequelize instance
  sequelize,
  // Specify the table name
  tableName: STUDENT_PHONE_TABLE,
  // Specify the model name
  modelName: 'studentPhone',
  // This table does not have timestamps; creation/update tracking
  // lives on the Phone record itself
  timestamps: false,
  // Composite unique constraint: the same phone cannot be linked to
  // the same student more than once
  indexes: [
    {
      unique: true,
      fields: ['id_estudiante', 'id_telefono'],
      name: 'uq_estudiante_telefono',
    },
  ],
});

// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the enrollments table
export const ENROLLMENT_TABLE = 'matricula';
// Define the Enrollment model
export const Enrollment = sequelize.define(ENROLLMENT_TABLE, {
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
    field: 'id_matricula',
  },
  // Foreign key to Student
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_estudiante_matricula',
    references: {
      model: 'estudiante',
      key: 'id_estudiante',
    },
  },
  // Foreign key to Group
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_grupo_matricula',
    references: {
      model: 'grupo',
      key: 'id_grupo',
    },
  },
  // Enrollment date
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_matricula',
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
  tableName: ENROLLMENT_TABLE,
  // Specify the model name
  modelName: 'enrollment',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
  // Composite unique constraint: a student can only be enrolled once in the same group
  indexes: [
    {
      unique: true,
      fields: [
        'id_estudiante_matricula',
        'id_grupo_matricula',
      ],
    },
  ],
});

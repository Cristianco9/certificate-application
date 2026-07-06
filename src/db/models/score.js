// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the scores table
export const SCORE_TABLE = 'calificacion';
// Define the Score model
export const Score = sequelize.define(SCORE_TABLE, {
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
    field: 'id_calificacion',
  },
  // Original score as recorded historically, kept unmodified regardless of scoring type
  originalScore: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'nota_original_calificacion',
  },
  // Score type: numeric (0.0 to 5.0) or alphabetic (e.g. 'Sobresaliente')
  scoreType: {
    type: DataTypes.ENUM('NUMERICA', 'ALFABETICA'),
    allowNull: false,
    field: 'tipo_nota_calificacion',
  },
  // Foreign key to Subject
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_asignatura_calificacion',
    references: {
      model: 'asignatura',
      key: 'id_asignatura',
    },
  },
  // Remedial/make-up score ('nota de habilitación')
  remedialScore: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'nota_habilitacion',
  },
  // Foreign key to Enrollment
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_matricula_calificacion',
    references: {
      model: 'matricula',
      key: 'id_matricula',
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
  tableName: SCORE_TABLE,
  // Specify the model name
  modelName: 'score',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
  // Composite unique constraint: one score per subject per enrollment
  indexes: [
    {
      unique: true,
      fields: [
        'id_asignatura_calificacion',
        'id_matricula_calificacion',
      ],
    },
  ],
});

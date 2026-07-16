// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the institution phones table
export const INSTITUTION_PHONE_TABLE = 'institucion_telefono';
// Define the InstitutionPhone model. Bridge table linking an
// Institution to one of its Phone records.
export const InstitutionPhone = sequelize.define(INSTITUTION_PHONE_TABLE, {
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
    field: 'id_institucion_telefono',
  },
  // Foreign key to Institution
  institutionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_institucion',
    references: {
      model: 'institucion',
      key: 'id_institucion',
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
  tableName: INSTITUTION_PHONE_TABLE,
  // Specify the model name
  modelName: 'institutionPhone',
  // This table does not have timestamps; creation/update tracking
  // lives on the Phone record itself
  timestamps: false,
  // Composite unique constraint: the same phone cannot be linked to
  // the same institution more than once
  indexes: [
    {
      unique: true,
      fields: ['id_institucion', 'id_telefono'],
      name: 'uq_institucion_telefono',
    },
  ],
});

// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the user phones table
export const USER_PHONE_TABLE = 'usuario_telefono';
// Define the UserPhone model. Bridge table linking a User to one of
// their Phone records (many-to-many: a user can have several phones,
// and in principle a phone row could be linked to more than one user
// record, though in practice each phone belongs to a single owner).
export const UserPhone = sequelize.define(USER_PHONE_TABLE, {
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
    field: 'id_usuario_telefono',
  },
  // Foreign key to User
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_usuario',
    references: {
      model: 'usuario',
      key: 'id_usuario',
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
  tableName: USER_PHONE_TABLE,
  // Specify the model name
  modelName: 'userPhone',
  // This table does not have timestamps; creation/update tracking
  // lives on the Phone record itself
  timestamps: false,
  // Composite unique constraint: the same phone cannot be linked to
  // the same user more than once
  indexes: [
    {
      unique: true,
      fields: ['id_usuario', 'id_telefono'],
      name: 'uq_usuario_telefono',
    },
  ],
});

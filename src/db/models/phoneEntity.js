// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the phone-entity link table
export const PHONE_ENTITY_TABLE = 'telefono_entidad';
// Define the PhoneEntity model. Acts as a polymorphic bridge table linking
// a single Phone record to exactly one of: User, Student, CertificateRecipient,
// or Institution. Which foreign key is populated determines the phone's owner;
// the other three must remain null for a given row.
export const PhoneEntity = sequelize.define(PHONE_ENTITY_TABLE, {
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
    field: 'id_telefono_entidad',
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
  },
  // Foreign key to User (nullable, populated only when the phone belongs to a user)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_usuario_telefonoentidad',
    references: {
      model: 'usuario',
      key: 'id_usuario',
    },
  },
  // Foreign key to Student (nullable, populated only when the phone belongs to a student)
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_estudiante_telefonoentidad',
    references: {
      model: 'estudiante',
      key: 'id_estudiante',
    },
  },
  // Foreign key to Certificate Recipient (nullable, populated only when the
  // phone belongs to a certificate recipient)
  certificateRecipientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_receptorcertificado_telefonoentidad',
    references: {
      model: 'receptor_certificado',
      key: 'id_receptor_certificado',
    },
  },
  // Foreign key to Institution (nullable, populated only when the phone belongs to an institution)
  institutionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_institucion_telefonoentidad',
    references: {
      model: 'institucion',
      key: 'id_institucion',
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
  tableName: PHONE_ENTITY_TABLE,
  // Specify the model name
  modelName: 'phoneEntity',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

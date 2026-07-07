// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the certificate signatures table
export const CERTIFICATE_SIGNATURE_TABLE = 'firma_certificado';
// Define the CertificateSignature model
export const CertificateSignature = sequelize.define(CERTIFICATE_SIGNATURE_TABLE, {
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
    field: 'id_firma_firmacertificado',
  },
  // Foreign key to User (the signer). Unique because each user
  // can only be registered as a single signer record.
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'id_usuario_firmacertificado',
    references: {
      model: 'usuario',
      key: 'id_usuario',
    },
  },
  // Foreign key to Certificate
  certificateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_certificado_firmacertificado',
    references: {
      model: 'certificado',
      key: 'id_certificado',
    },
  },
  // Foreign key to Municipality
  municipalityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_municipio',
    references: {
      model: 'municipio',
      key: 'id_municipio',
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
  tableName: CERTIFICATE_SIGNATURE_TABLE,
  // Specify the model name
  modelName: 'certificateSignature',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

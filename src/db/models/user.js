// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the users table
export const USER_TABLE = 'usuario';
// Define the User model
export const User = sequelize.define(USER_TABLE, {
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
    field: 'id_usuario',
  },
  // User first name(s)
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'nombres_usuario',
  },
  // User last name(s)
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'apellidos_usuario',
  },
  // Foreign key to Document Type
  documentTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_tipodocumento_usuario',
    references: {
      model: 'tipo_documento',
      key: 'id_tipo_documento',
    },
  },
  // Document number
  documentNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'identificacion_usuario',
  },
  // Foreign key to Municipality
  municipalityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_municipio_usuario',
    references: {
      model: 'municipio',
      key: 'id_municipio',
    },
  },
  // Foreign key to Role
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_rol_usuario',
    references: {
      model: 'rol',
      key: 'id_rol',
    },
  },
  // Foreign key to Academic Level
  academicLevelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_nivel_academico',
    references: {
      model: 'nivel_academico',
      key: 'id_nivel_academico',
    },
  },
  // Email
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
    field: 'email_usuario',
    validate: {
      isEmail: true,
    },
  },
  // User status
  status: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    allowNull: false,
    field: 'estado_usuario',
  },
  // Password hash
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_usuario',
  },
  // Foreign key to Gender
  genderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_genero',
    references: {
      model: 'genero',
      key: 'id_genero',
    },
  },
  // Last login date
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ultimo_login_usuario',
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
  tableName: USER_TABLE,
  // Specify the model name
  modelName: 'user',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
});

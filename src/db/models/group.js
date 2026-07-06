// Import the sequelize instance from the database connection library
import { sequelize } from '../../libraries/DBConnection.js';
// Import DataTypes from sequelize to define column types
import { DataTypes } from 'sequelize';
// Define the name of the groups table
export const GROUP_TABLE = 'grupo';
// Define the Group model
export const Group = sequelize.define(GROUP_TABLE, {
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
    field: 'id_grupo',
  },
  // Group name (e.g. '11-A')
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'nombre_grupo',
  },
  // Academic year of the group. MySQL's native YEAR type has no supported
  // Sequelize DataType (a raw type string is rejected by the query generator),
  // so it is mapped as INTEGER instead. This is portable across dialects but
  // does not enforce MySQL's YEAR range (1901-2155) at the DB level; add a
  // Joi range validation (min 1901, max 2155) at the schema layer if needed.
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'anio_grupo',
  },
  // Foreign key to Grade
  gradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_grado_grupo',
    references: {
      model: 'grado',
      key: 'id_grado',
    },
  },
  // School day shift
  shift: {
    type: DataTypes.ENUM('DIURNA', 'NOCTURNA'),
    allowNull: false,
    field: 'jornada',
  },
  // Foreign key to Institution
  institutionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_institucion',
    references: {
      model: 'institucion',
      key: 'id_institucion',
    },
  },
  // Group status
  status: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    allowNull: false,
    field: 'estado_grupo',
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
  tableName: GROUP_TABLE,
  // Specify the model name
  modelName: 'group',
  // Enable automatic timestamps
  timestamps: true,
  // Map Sequelize timestamps to database columns
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion',
  // Composite unique constraint: a group name must be unique per year, grade and institution
  indexes: [
    {
      unique: true,
      fields: [
        'nombre_grupo',
        'anio_grupo',
        'id_grado_grupo',
        'id_institucion',
      ],
    },
  ],
});

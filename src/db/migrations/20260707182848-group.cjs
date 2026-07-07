'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'grupo' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grupo', {

      // Primary key
      id_grupo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Group name (e.g. '11-A')
      nombre_grupo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // Academic year of the group. MySQL's native YEAR type has no direct
      // Sequelize CLI equivalent in this migration layer either, so it is
      // mapped as INTEGER, matching the application-level model definition.
      anio_grupo: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // Foreign key to grado (optional) — SET NULL on delete
      id_grado_grupo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'grado',
          key: 'id_grado',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // School day shift
      jornada: {
        type: Sequelize.ENUM('DIURNA', 'NOCTURNA'),
        allowNull: false,
      },

      // Foreign key to institucion (optional) — SET NULL on delete
      id_institucion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'institucion',
          key: 'id_institucion',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // Group status
      estado_grupo: {
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO'),
        allowNull: false,
      },

      // Creation timestamp
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      // Update timestamp
      fecha_modificacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

    });

    // Composite unique constraint: a group name must be unique per year,
    // grade and institution
    await queryInterface.addIndex('grupo', {
      unique: true,
      fields: [
        'nombre_grupo',
        'anio_grupo',
        'id_grado_grupo',
        'id_institucion',
      ],
      name: 'grupo_nombre_anio_grado_institucion_unique',
    });
  },

  // ============================================================
  // DOWN — Drop the 'grupo' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('grupo');
  },

};

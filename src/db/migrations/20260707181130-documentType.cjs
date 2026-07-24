'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'tipo_documento' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipo_documento', {

      // Primary key
      id_tipo_documento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Document type name (e.g. 'Cédula de Ciudadanía', 'Tarjeta de Identidad', 'Registro Civil', 'Cédula de Extranjería', 'Pasaporte', 'Permiso Especial de Permanencia (PEP)', 'NIT')
      nombre_tipodocumento: {
        type: Sequelize.ENUM('Cédula de Ciudadanía', 'Tarjeta de Identidad', 'Registro Civil', 'Cédula de Extranjería', 'Pasaporte', 'Permiso Especial de Permanencia (PEP)', 'NIT'),
        allowNull: false,
        unique: true,
      },

      // Creation timestamp
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      // Update timestamp
      fecha_modificacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  // ============================================================
  // DOWN — Drop the 'tipo_documento' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tipo_documento');
  },
};

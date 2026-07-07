'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'nivel_academico' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nivel_academico', {

      // Primary key
      id_nivel_academico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Academic level name (e.g. 'Preescolar', 'Básica Primaria', 'Básica Secundaria', 'Media')
      nombre_nivel_academico: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      // Academic level abbreviation (e.g. 'PRE', 'PRIM', 'SEC', 'MED')
      abreviatura_nivel_academico: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
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
  },

  // ============================================================
  // DOWN — Drop the 'nivel_academico' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nivel_academico');
  },

};

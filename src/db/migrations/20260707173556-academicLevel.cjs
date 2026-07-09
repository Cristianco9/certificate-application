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

      // Academic level (e.g 'Técnico', 'Tecnológo', 'Licenciado', 'Especialsita', 'Maestría', 'Doctorado', 'Post-Doctorado'),
      nombre_nivel_academico: {
        type: DataTypes.ENUM('Técnico', 'Tecnológo', 'Licenciado', 'Especialsita', 'Maestría', 'Doctorado', 'Post-Doctorado'),
        allowNull: false,
        unique: true,
      },

      // Academic level abbreviation (e.g. 'Téc', 'Tec', 'Lic', 'Esp', 'Mgs', 'Ph.D')
      abreviatura_nivel_academico: {
        type: DataTypes.ENUM('Téc', 'Tec', 'Lic', 'Esp', 'Mgs', 'Ph.D'),
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

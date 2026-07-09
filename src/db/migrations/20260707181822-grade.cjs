'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'grado' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grado', {

      // Primary key
      id_grado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Grade name (e.g. 'Primero', 'Segundo', 'Once')
      nombre_grado: {
        type: DataTypes.ENUM('Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo'),
        allowNull: false,
        unique: true,
      },

      // Grade description
      descripcion_grado: {
        type: Sequelize.STRING(50),
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
  },

  // ============================================================
  // DOWN — Drop the 'grado' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('grado');
  },

};

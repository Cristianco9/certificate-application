'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'telefono' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('telefono', {

      // Primary key
      id_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Phone number
      numero_telefono: {
        type: Sequelize.STRING(20),
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
  // DOWN — Drop the 'telefono' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('telefono');
  },

};

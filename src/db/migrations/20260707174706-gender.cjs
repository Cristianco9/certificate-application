'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'genero' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('genero', {

      // Primary key
      id_genero: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Gender name (g.s 'Masculino', 'Femenino', 'No binario', 'Otro', 'Prefiero no decirlo')
      nombre_genero: {
        type: DataTypes.ENUM('Masculino', 'Femenino', 'No binario', 'Otro', 'Prefiero no decirlo'),
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
  // DOWN — Drop the 'genero' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('genero');
  },

};

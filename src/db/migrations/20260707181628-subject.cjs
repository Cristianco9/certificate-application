'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'asignatura' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asignatura', {

      // Primary key
      id_asignatura: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Subject name
      nombre_asignatura: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },

      // Subject description
      descripcion_asignatura: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // Weekly hourly intensity (small integer, e.g. hours per week)
      intensidad_horaria: {
        type: Sequelize.SMALLINT,
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
  // DOWN — Drop the 'asignatura' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('asignatura');
  },

};

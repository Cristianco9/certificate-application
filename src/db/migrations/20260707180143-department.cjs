'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'departamento' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departamento', {

      // Primary key. No autoIncrement: matches the original SQL design.
      id_departamento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Department name
      nombre_departamento: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // Foreign key to pais — RESTRICT on delete
      id_pais: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pais',
          key: 'id_pais',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
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
  // DOWN — Drop the 'departamento' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('departamento');
  },

};

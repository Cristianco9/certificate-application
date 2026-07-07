'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'municipio' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('municipio', {

      // Primary key. No autoIncrement: matches the original SQL design.
      id_municipio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },

      // Municipality name
      nombre_municipio: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // Foreign key to departamento — RESTRICT on delete
      id_departamento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departamento',
          key: 'id_departamento',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
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
  // DOWN — Drop the 'municipio' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('municipio');
  },

};

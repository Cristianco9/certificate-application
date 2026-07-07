'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'pais' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pais', {

      // Primary key. No autoIncrement: matches the original SQL design,
      // where country codes are expected to be assigned manually/by seed
      // data rather than generated sequentially.
      id_pais: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },

      // Country name
      nombre_pais: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      // ISO 3166-1 alpha-2 country code
      codigo_iso2: {
        type: Sequelize.STRING(2),
        allowNull: true,
      },

      // Extra reserved varchar field 1 for future use
      extra_varchar_1: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // Extra reserved varchar field 2 for future use
      extra_varchar_2: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // Extra reserved varchar field 3 for future use
      extra_varchar_3: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // Extra reserved integer field 1 for future use
      extra_int_1: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // Extra reserved integer field 2 for future use
      extra_int_2: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
  // DOWN — Drop the 'pais' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pais');
  },

};

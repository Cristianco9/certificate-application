'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Insert Colombia only if it does not already exist.
   * This makes the seeder idempotent (safe to run multiple times).
   */
  up: async (queryInterface, Sequelize) => {
    // Check if Colombia already exists
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id_pais FROM pais WHERE nombre_pais = 'Colombia'`
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert('pais', [
        {
          nombre_pais: 'Colombia',
          codigo_iso2: 'CO',
        },
      ]);
    } else {
      console.log('Country "Colombia" already exists. Skipping insert.');
    }
  },

  /**
   * Remove Colombia (only for rollback).
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('pais', { nombre_pais: 'Colombia' });
  },
};

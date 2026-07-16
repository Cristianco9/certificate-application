'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Insert all gender options using INSERT IGNORE to avoid duplicates.
   * This is idempotent and safe to run multiple times.
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO genero (nombre_genero) VALUES
        ('Masculino'),
        ('Femenino'),
        ('No binario'),
        ('Otro'),
        ('Prefiero no decirlo')
    `);
  },

  /**
   * Remove all gender records.
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('genero', {
      nombre_genero: [
        'Masculino',
        'Femenino',
        'No binario',
        'Otro',
        'Prefiero no decirlo'
      ],
    });
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Insert all academic levels using INSERT IGNORE.
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO nivel_academico (nombre_nivel_academico, abreviatura_nivel_academico) VALUES
        ('Técnico', 'Téc'),
        ('tecnólogo', 'Tgo'),
        ('Licenciado', 'Lic'),
        ('Especialista', 'Esp'),
        ('Maestría', 'Mgs'),
        ('Doctorado', 'Ph.D'),
        ('Post-Doctorado', 'Ph.D')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('nivel_academico', {
      nombre_nivel_academico: [
        'Técnico', 'tecnólogo', 'Licenciado', 'Especialista',
        'Maestría', 'Doctorado', 'Post-Doctorado'
      ],
    });
  },
};

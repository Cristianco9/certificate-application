'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Insert all document types using INSERT IGNORE.
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO tipo_documento (nombre_tipodocumento) VALUES
        ('Cédula de Ciudadanía'),
        ('Tarjeta de Identidad'),
        ('Registro Civil'),
        ('Cédula de Extranjería'),
        ('Pasaporte'),
        ('Permiso Especial de Permanencia (PEP)'),
        ('NIT')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tipo_documento', {
      nombre_tipodocumento: [
        'Cédula de Ciudadanía',
        'Tarjeta de Identidad',
        'Registro Civil',
        'Cédula de Extranjería',
        'Pasaporte',
        'Permiso Especial de Permanencia (PEP)',
        'NIT'
      ],
    });
  },
};

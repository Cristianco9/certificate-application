'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Insert all 32 Colombian departments.
   * The country ID is fixed as 1 because Colombia is the only country seeded.
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('departamento', [
      { nombre_departamento: 'Amazonas', id_pais: 1 },
      { nombre_departamento: 'Antioquia', id_pais: 1 },
      { nombre_departamento: 'Arauca', id_pais: 1 },
      { nombre_departamento: 'Atlántico', id_pais: 1 },
      { nombre_departamento: 'Bolívar', id_pais: 1 },
      { nombre_departamento: 'Boyacá', id_pais: 1 },
      { nombre_departamento: 'Caldas', id_pais: 1 },
      { nombre_departamento: 'Caquetá', id_pais: 1 },
      { nombre_departamento: 'Casanare', id_pais: 1 },
      { nombre_departamento: 'Cauca', id_pais: 1 },
      { nombre_departamento: 'Cesar', id_pais: 1 },
      { nombre_departamento: 'Chocó', id_pais: 1 },
      { nombre_departamento: 'Córdoba', id_pais: 1 },
      { nombre_departamento: 'Cundinamarca', id_pais: 1 },
      { nombre_departamento: 'Guainía', id_pais: 1 },
      { nombre_departamento: 'Guaviare', id_pais: 1 },
      { nombre_departamento: 'Huila', id_pais: 1 },
      { nombre_departamento: 'La Guajira', id_pais: 1 },
      { nombre_departamento: 'Magdalena', id_pais: 1 },
      { nombre_departamento: 'Meta', id_pais: 1 },
      { nombre_departamento: 'Nariño', id_pais: 1 },
      { nombre_departamento: 'Norte de Santander', id_pais: 1 },
      { nombre_departamento: 'Putumayo', id_pais: 1 },
      { nombre_departamento: 'Quindío', id_pais: 1 },
      { nombre_departamento: 'Risaralda', id_pais: 1 },
      { nombre_departamento: 'San Andrés y Providencia', id_pais: 1 },
      { nombre_departamento: 'Santander', id_pais: 1 },
      { nombre_departamento: 'Sucre', id_pais: 1 },
      { nombre_departamento: 'Tolima', id_pais: 1 },
      { nombre_departamento: 'Valle del Cauca', id_pais: 1 },
      { nombre_departamento: 'Vaupés', id_pais: 1 },
      { nombre_departamento: 'Vichada', id_pais: 1 },
    ]);
  },

  /**
   * Remove all departments linked to Colombia.
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('departamento', { id_pais: 1 });
  },
};

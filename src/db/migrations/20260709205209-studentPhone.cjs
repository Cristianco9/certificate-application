'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'estudiante_telefono' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estudiante_telefono', {

      // Primary key
      id_estudiante_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Foreign key to estudiante — CASCADE on delete
      id_estudiante: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estudiante',
          key: 'id_estudiante',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // Foreign key to telefono — CASCADE on delete
      id_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'telefono',
          key: 'id_telefono',
        },
        onDelete: 'CASCADE',
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

    // Composite unique constraint: the same phone cannot be linked to
    // the same student more than once
    await queryInterface.addIndex('estudiante_telefono', {
      unique: true,
      fields: ['id_estudiante', 'id_telefono'],
      name: 'uq_estudiante_telefono',
    });
  },

  // ============================================================
  // DOWN — Drop the 'estudiante_telefono' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('estudiante_telefono');
  },

};

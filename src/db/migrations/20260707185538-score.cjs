'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'calificacion' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calificacion', {

      // Primary key
      id_calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Original score as recorded historically, kept unmodified regardless of scoring type
      nota_original_calificacion: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      // Score type: numeric (0.0 to 5.0) or alphabetic (e.g. 'Sobresaliente')
      tipo_nota_calificacion: {
        type: Sequelize.ENUM('NUMERICA', 'ALFABETICA'),
        allowNull: false,
      },

      // Foreign key to asignatura — RESTRICT on delete
      id_asignatura_calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'asignatura',
          key: 'id_asignatura',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Remedial/make-up score ('nota de habilitación')
      nota_habilitacion: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      // Foreign key to matricula — RESTRICT on delete
      id_matricula_calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'matricula',
          key: 'id_matricula',
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

    // Composite unique constraint: one score per subject per enrollment
    await queryInterface.addIndex('calificacion', {
      unique: true,
      fields: [
        'id_asignatura_calificacion',
        'id_matricula_calificacion',
      ],
      name: 'calificacion_asignatura_matricula_unique',
    });
  },

  // ============================================================
  // DOWN — Drop the 'calificacion' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calificacion');
  },

};

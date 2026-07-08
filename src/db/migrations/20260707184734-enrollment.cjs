'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'matricula' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matricula', {

      // Primary key
      id_matricula: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Foreign key to estudiante (optional) — SET NULL on delete
      id_estudiante_matricula: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'estudiante',
          key: 'id_estudiante',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // Foreign key to grupo (optional) — SET NULL on delete
      id_grupo_matricula: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'grupo',
          key: 'id_grupo',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // Enrollment date
      fecha_matricula: {
        type: Sequelize.DATEONLY,
        allowNull: false,
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

    // Composite unique constraint: a student can only be enrolled once in the same group
    await queryInterface.addIndex('matricula', {
      unique: true,
      fields: [
        'id_estudiante_matricula',
        'id_grupo_matricula',
      ],
      name: 'matricula_estudiante_grupo_unique',
    });
  },

  // ============================================================
  // DOWN — Drop the 'matricula' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('matricula');
  },

};

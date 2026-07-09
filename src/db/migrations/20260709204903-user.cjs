'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'usuario_telefono' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario_telefono', {

      // Primary key
      id_usuario_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Foreign key to usuario — CASCADE on delete
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id_usuario',
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

    });

    // Composite unique constraint: the same phone cannot be linked to
    // the same user more than once
    await queryInterface.addIndex('usuario_telefono', {
      unique: true,
      fields: ['id_usuario', 'id_telefono'],
      name: 'uq_usuario_telefono',
    });
  },

  // ============================================================
  // DOWN — Drop the 'usuario_telefono' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_telefono');
  },

};

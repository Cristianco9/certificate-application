'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'receptor_certificado_telefono' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('receptor_certificado_telefono', {

      // Primary key
      id_receptor_certificado_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Foreign key to receptor_certificado — CASCADE on delete
      id_receptor_certificado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'receptor_certificado',
          key: 'id_receptor_certificado',
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
    // the same certificate recipient more than once
    await queryInterface.addIndex('receptor_certificado_telefono', {
      unique: true,
      fields: ['id_receptor_certificado', 'id_telefono'],
      name: 'uq_receptor_certificado_telefono',
    });
  },

  // ============================================================
  // DOWN — Drop the 'receptor_certificado_telefono' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('receptor_certificado_telefono');
  },

};

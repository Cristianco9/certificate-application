'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'firma_certificado' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('firma_certificado', {

      // Primary key
      id_firma_firmacertificado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Foreign key to usuario (the signer). Unique because each user
      // can only be registered as a single signer record — RESTRICT on delete
      id_usuario_firmacertificado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'usuario',
          key: 'id_usuario',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Foreign key to certificado — RESTRICT on delete
      id_certificado_firmacertificado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'certificado',
          key: 'id_certificado',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Foreign key to municipio — RESTRICT on delete
      id_municipio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'municipio',
          key: 'id_municipio',
        },
        onDelete: 'RESTRICT',
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
  },

  // ============================================================
  // DOWN — Drop the 'firma_certificado' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('firma_certificado');
  },

};

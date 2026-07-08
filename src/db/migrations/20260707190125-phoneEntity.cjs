'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'telefono_entidad' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('telefono_entidad', {

      // Primary key
      id_telefono_entidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // Foreign key to telefono — RESTRICT on delete
      id_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'telefono',
          key: 'id_telefono',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Foreign key to usuario (nullable, populated only when the phone
      // belongs to a user) — SET NULL on delete
      id_usuario_telefonoentidad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // Foreign key to estudiante (nullable, populated only when the phone
      // belongs to a student) — SET NULL on delete
      id_estudiante_telefonoentidad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'estudiante',
          key: 'id_estudiante',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // Foreign key to receptor_certificado (nullable, populated only when
      // the phone belongs to a certificate recipient) — SET NULL on delete
      id_receptorcertificado_telefonoentidad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'receptor_certificado',
          key: 'id_receptor_certificado',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // Foreign key to institucion (nullable, populated only when the phone
      // belongs to an institution) — SET NULL on delete
      id_institucion_telefonoentidad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'institucion',
          key: 'id_institucion',
        },
        onDelete: 'SET NULL',
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
  },

  // ============================================================
  // DOWN — Drop the 'telefono_entidad' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('telefono_entidad');
  },

};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  // ============================================================
  // UP — Create the 'usuario' table
  // ============================================================
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario', {

      // Primary key
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },

      // User first name(s)
      nombres_usuario: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // User last name(s)
      apellidos_usuario: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // Foreign key to tipo_documento — RESTRICT on delete
      id_tipodocumento_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_documento',
          key: 'id_tipo_documento',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Document number
      identificacion_usuario: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },

      // Foreign key to municipio — RESTRICT on delete
      id_municipio_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'municipio',
          key: 'id_municipio',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Foreign key to rol — RESTRICT on delete
      id_rol_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rol',
          key: 'id_rol',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Foreign key to nivel_academico — RESTRICT on delete
      id_nivel_academico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nivel_academico',
          key: 'id_nivel_academico',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Email
      email_usuario: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true,
      },

      // User status
      estado_usuario: {
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO'),
        allowNull: false,
      },

      // Password hash
      password_usuario: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      // Foreign key to genero — RESTRICT on delete
      id_genero: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'genero',
          key: 'id_genero',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      // Last login date
      ultimo_login_usuario: {
        type: Sequelize.DATE,
        allowNull: false,
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
  // DOWN — Drop the 'usuario' table
  // ============================================================
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario');
  },

};

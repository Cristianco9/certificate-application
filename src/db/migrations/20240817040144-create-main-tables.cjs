const { DataTypes } = require('sequelize');

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'first_name',
      },
      secondName: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'second_name',
      },
      firstLastName: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'first_last_name',
      },
      secondLastName: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'second_last_name',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    });

    await queryInterface.createTable('readers', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      username: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(65),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('students');
    await queryInterface.dropTable('readers');
  }
};

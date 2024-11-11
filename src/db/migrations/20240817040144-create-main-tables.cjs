const { DataTypes } = require('sequelize');

'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('users', {

      // Define the 'id' column as an integer
      id: {
        // Integer type with a length of 10
        type: DataTypes.INTEGER,
        // This field cannot be null
        allowNull: false,
        // This field is the primary key
        primaryKey: true,
        // This field must be unique across all records
        unique: true,
        // auto increment the users id
        autoIncrement: true,
      },

      // Define the 'username' column
      username: {
        // Text type with a maximum length of 20 characters
        type: DataTypes.STRING(20),
        // This field cannot be null
        allowNull: false,
        // This field need to be unique
        unique: true,
      },

      // Define the 'password' column
      password: {
        // Text type with a maximum length of 65 characters
        type: DataTypes.STRING(65),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
      },

      // Define the 'email' column
      email: {
        // Text type with a maximum length of 50 characters
        type: DataTypes.STRING(50),
        // This field cannot be null
        allowNull: false,
        // This field need to be unique
        unique: true,
      },

      // Define the 'first_name' column
      firstName: {
        // Text type with a maximum length of 20 characters
        type: DataTypes.STRING(20),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'first_name',
      },

      // Define the 'middle_name' column
      middleName: {
        // Text type with a maximum length of 20 characters
        type: DataTypes.STRING(20),
        // This field cannot be null
        allowNull: true,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'middle_name',
      },

      // Define the 'first_last_name' column
      firstLastName: {
        // Text type with a maximum length of 20 characters
        type: DataTypes.STRING(20),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'first_last_name',
      },

      // Define the 'second_last_name' column
      secondLastName: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(20),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'second_last_name',
      },

      // Define the 'createdAt' column
      createdAt: {
        // Date type for the creation timestamp
        type: DataTypes.DATE,
        // Automatically set the current timestamp when the record is created
        defaultValue: DataTypes.NOW,
        // This field cannot be null
        allowNull: false,
        // Translate the field name from camelCase to snake_case
        field: 'created_at',
      },

      // Define the 'updatedAt' column
      updatedAt: {
        // Date type for the last update timestamp
        type: DataTypes.DATE,
        // Automatically update the timestamp when the record is updated
        defaultValue: DataTypes.NOW,
        // This field cannot be null
        allowNull: false,
        // Translate the field name from camelCase to snake_case
        field: 'updated_at',
      }

    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.dropTable('users');

  }
};

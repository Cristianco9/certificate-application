const { DataTypes } = require('sequelize');

'use strict';

/**
 * Migration script for creating the 'students' table.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  /**
   * This function is called when the migration is applied.
   * It creates the 'students' table with specified columns and constraints.
   *
   * @param {object} queryInterface
   * - The interface for database query execution.
   * @param {object} Sequelize
   * - The Sequelize library instance.
   */
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('students', {
      /**
       * The 'id' column - primary key of the table.
       */
      id: {
        // Integer type with a length of 10
        type: DataTypes.INTEGER(),
        // This field cannot be null
        allowNull: false,
        // This field is the primary key
        primaryKey: true,
        // This field must be unique across all records
        unique: true
      },

      /**
       * The 'firstName' column.
       */
      firstName: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(10),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'first_name'
      },

      /**
       * The 'secondName' column.
       */
      secondName: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(10),
        // This field can be null
        allowNull: true,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'second_name'
      },

      /**
       * The 'firstLastName' column.
       */
      firstLastName: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(10),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'first_last_name'
      },

      /**
       * The 'secondLastName' column.
       */
      secondLastName: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(10),
        // This field can be null
        allowNull: true,
        // This field does not need to be unique
        unique: false,
        // Translate the field name from camelCase to snake_case
        field: 'second_last_name'
      }
    });

    await queryInterface.createTable('readers', {
      // Define the 'id' column as an integer
      id: {
        // Integer type with a length of 10
        type: DataTypes.INTEGER(10),
        // This field cannot be null
        allowNull: false,
        // This field is the primary key
        primaryKey: true,
        // This field must be unique across all records
        unique: true
      },

      // Define the 'username' column
      username: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(10),
        // This field cannot be null
        allowNull: false,
        // This field need to be unique
        unique: true,
      },

      // Define the 'password' column
      password: {
        // Text type with a maximum length of 10 characters
        type: DataTypes.STRING(10),
        // This field cannot be null
        allowNull: false,
        // This field does not need to be unique
        unique: false,
      }
    });

  },

  /**
   * This function is called when the migration is rolled back.
   * It drops the 'students' table.
   *
   * @param {object} queryInterface
   * - The interface for database query execution.
   * @param {object} Sequelize
   * - The Sequelize library instance.
   */
  async down(queryInterface, Sequelize) {

    await queryInterface.dropTable('students');
    await queryInterface.dropTable('readers');
  }
};

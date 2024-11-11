const { DataTypes } = require('sequelize');

'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {

  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert(
      'users',
      [
        {
          username: 'administrador',
          password: '$2a$11$8I0CpxzUm9IZmyBD9Q.tt.HtPtxE56lx2pPxZrhv6.J.7ZuxBhs..',
          email: 'administrador@mail.com',
          first_name: 'administrador',
          middle_name: 'administrador',
          first_last_name: 'administrador',
          second_last_name: 'administrador',
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete(
      'users',
      {
        username: 'administrador'
      },
      {}
    );
  }

};

// src/db/seeders/20261006120000-institution-phone.cjs
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Registers the real institution's contact phone numbers and links them
   * to the institution through the `institucion_telefono` bridge table.
   *
   * Phone numbers are taken from the certificate header:
   *   - Tel: 2298849
   *   - Fax: 2490075
   *
   * Idempotent:
   *   - phones      → INSERT IGNORE (numero_telefono has a UNIQUE index)
   *   - bridge rows → INSERT IGNORE (uq_institucion_telefono composite UNIQUE)
   *
   * The institution is resolved by its NIT (891900837-2), matching the
   * pattern used by `20260910054226-institution.cjs`.
   */
  up: async (queryInterface, Sequelize) => {
    // 1. Insert the two phone numbers (skip if already present)
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO telefono (numero_telefono) VALUES
        ('2298849'),
        ('2490075')
    `);

    // 2. Resolve the institution id by NIT
    const [institutions] = await queryInterface.sequelize.query(
      `SELECT id_institucion FROM institucion WHERE nit_institucion = '891900837-2' LIMIT 1;`
    );
    const institutionId = institutions[0]?.id_institucion;

    if (!institutionId) {
      throw new Error(
        'Cannot seed institution phones: the institution with NIT 891900837-2 was not found.'
      );
    }

    // 3. Link both phones to the institution in a single statement.
    //    INSERT IGNORE respects the uq_institucion_telefono unique index,
    //    so re-running this seeder is safe.
    await queryInterface.sequelize.query(
      `INSERT IGNORE INTO institucion_telefono (id_institucion, id_telefono)
       SELECT :institutionId, id_telefono
       FROM telefono
       WHERE numero_telefono IN ('2298849', '2490075');`,
      { replacements: { institutionId } }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Remove only the bridge links belonging to this institution
    const [institutions] = await queryInterface.sequelize.query(
      `SELECT id_institucion FROM institucion WHERE nit_institucion = '891900837-2' LIMIT 1;`
    );
    const institutionId = institutions[0]?.id_institucion;

    if (institutionId) {
      await queryInterface.sequelize.query(
        `DELETE FROM institucion_telefono
         WHERE id_institucion = :institutionId
           AND id_telefono IN (
             SELECT id_telefono FROM telefono
             WHERE numero_telefono IN ('2298849', '2490075')
           );`,
        { replacements: { institutionId } }
      );
    }

    // 2. Remove the phone records themselves
    await queryInterface.sequelize.query(
      `DELETE FROM telefono WHERE numero_telefono IN ('2298849', '2490075');`
    );
  },
};

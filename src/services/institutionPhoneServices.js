// Import the InstitutionPhone data model
import { InstitutionPhone } from '../db/models/institutionPhone.js';
// Import related models to embed FK data as nested objects and to verify
// referential integrity before writing
import { Institution } from '../db/models/institution.js';
import { Phone } from '../db/models/phone.js';
// Import the other three ownership bridge tables so this service can
// enforce the same cross-bridge "single owner per phone" rule documented
// in models/index.js and implemented by PhoneServices
import { UserPhone } from '../db/models/userPhone.js';
import { StudentPhone } from '../db/models/studentPhone.js';
import { CertificateRecipientPhone } from '../db/models/certificateRecipientPhone.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the InstitutionPhone (institucion_telefono)
 * bridge entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * This bridge links an Institution to one of its Phone records. The
 * database enforces a composite unique index on
 * (id_institucion, id_telefono), but this service still checks that
 * combination explicitly before writing, per AGENTS.md section 6, so
 * a duplicate link surfaces a clear Boom.conflict instead of the raw
 * ORM unique-constraint error.
 *
 * Additionally, this service enforces the cross-bridge invariant
 * documented in models/index.js: a given Phone row must only ever be
 * linked through ONE of the four bridge tables (UserPhone, StudentPhone,
 * InstitutionPhone, CertificateRecipientPhone), never more than one.
 * MySQL cannot express that exclusive-or across four tables
 * declaratively, so it is enforced here via _assertPhoneIsAvailable.
 *
 * Every method that returns an InstitutionPhone record (listOne,
 * listAll, listByInstitution, listByPhone, getByInstitutionAndPhone)
 * embeds the related institution and phone as nested objects, rather
 * than exposing the raw 'institutionId'/'phoneId' foreign key integers.
 */
export class InstitutionPhoneServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new InstitutionPhone record, linking a phone to an
   * institution.
   *
   * @param {Object} newInstitutionPhone
   * @param {number|string} newInstitutionPhone.institutionId
   * @param {number|string} newInstitutionPhone.phoneId
   * @returns {Promise<{status: string}>}
   */
  async createOne(newInstitutionPhone) {

    try {
      // Verify the referenced institution and phone actually exist
      // before linking them
      await this._assertExists(Institution, newInstitutionPhone.institutionId, 'Institution');
      await this._assertExists(Phone, newInstitutionPhone.phoneId, 'Phone');

      // Verify this exact link does not already exist, mirroring the
      // composite unique index defined at the database level
      const existingLink = await this._findByInstitutionAndPhone(
        newInstitutionPhone.institutionId, newInstitutionPhone.phoneId
      );

      if (existingLink) {
        throw Boom.conflict('The phone is already linked to the provided institution');
      }

      // Enforce the cross-bridge single-owner rule: the phone must not
      // already be linked to any other owner (user, student, institution,
      // or certificate recipient)
      await this._assertPhoneIsAvailable(newInstitutionPhone.phoneId, newInstitutionPhone.institutionId);

      // Create the record (id is generated automatically)
      await InstitutionPhone.create({
        institutionId: newInstitutionPhone.institutionId,
        phoneId: newInstitutionPhone.phoneId,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to link the phone to the institution in the database'
      });
    }
  }

  /**
   * Deletes an InstitutionPhone record by its id.
   *
   * @param {number|string} institutionPhoneId
   * @returns {Promise<{status: string}>}
   */
  async deleteOne(institutionPhoneId) {

    if (!institutionPhoneId) {
      throw Boom.badRequest('No institution-phone identifier was provided');
    }

    try {
      const existingLink = await this._findById(institutionPhoneId);

      if (!existingLink) {
        throw Boom.notFound('Institution-phone link not found');
      }

      const deletedRows = await InstitutionPhone.destroy({
        where: { id: institutionPhoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Institution-phone link not found');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the institution in the database' });
    }
  }

  /**
   * Deletes an InstitutionPhone record by its composite key
   * (institutionId + phoneId). Convenience equivalent of looking up the
   * id first, then calling deleteOne — matches the shape callers
   * usually already have.
   *
   * @param {number|string} institutionId
   * @param {number|string} phoneId
   * @returns {Promise<{status: string}>}
   */
  async unlinkByInstitutionAndPhone(institutionId, phoneId) {

    if (!institutionId || !phoneId) {
      throw Boom.badRequest('Both an institution identifier and a phone identifier must be provided');
    }

    try {
      const deletedRows = await InstitutionPhone.destroy({
        where: { institutionId, phoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('The phone is not currently linked to the provided institution');
      }

      return { status: 'UNLINKED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the institution in the database' });
    }
  }

  /**
   * Retrieves a single InstitutionPhone record by its id, embedding its
   * related institution and phone as nested objects.
   *
   * @param {number|string} institutionPhoneId
   * @returns {Promise<Object>}
   */
  async listOne(institutionPhoneId) {

    if (!institutionPhoneId) {
      throw Boom.badRequest('No institution-phone identifier was provided');
    }

    try {
      const theLink = await InstitutionPhone.findOne({
        where: { id: institutionPhoneId },
        include: InstitutionPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('Institution-phone link not found');
      }

      return InstitutionPhoneServices._formatInstitutionPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution-phone link' });
    }
  }

  /**
   * Retrieves all InstitutionPhone records, ordered by id ascending,
   * each with its related institution and phone embedded as nested
   * objects.
   *
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listAll() {

    try {
      const allLinks = await InstitutionPhone.findAll({
        order: [['id', 'ASC']],
        include: InstitutionPhoneServices.CATALOG_INCLUDES,
      });

      const records = allLinks.map(InstitutionPhoneServices._formatInstitutionPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution-phone links' });
    }
  }

  /**
   * Retrieves every InstitutionPhone record belonging to a given
   * institution, each with its related phone embedded as a nested
   * object. This is the primary lookup used to list all phones owned
   * by an institution.
   *
   * @param {number|string} institutionId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByInstitution(institutionId) {

    if (!institutionId) {
      throw Boom.badRequest('No institution identifier was provided');
    }

    try {
      const linksByInstitution = await InstitutionPhone.findAll({
        where: { institutionId },
        order: [['id', 'ASC']],
        include: InstitutionPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByInstitution.map(InstitutionPhoneServices._formatInstitutionPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution-phone links for the given institution' });
    }
  }

  /**
   * Retrieves every InstitutionPhone record referencing a given phone,
   * each with its related institution embedded as a nested object. In
   * practice this returns at most one record, since the cross-bridge
   * single-owner rule limits a phone to a single owner overall.
   *
   * @param {number|string} phoneId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByPhone(phoneId) {

    if (!phoneId) {
      throw Boom.badRequest('No phone identifier was provided');
    }

    try {
      const linksByPhone = await InstitutionPhone.findAll({
        where: { phoneId },
        order: [['id', 'ASC']],
        include: InstitutionPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByPhone.map(InstitutionPhoneServices._formatInstitutionPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution-phone links for the given phone' });
    }
  }

  /**
   * Retrieves the single InstitutionPhone record (if any) linking a
   * specific institution to a specific phone. Useful to check whether
   * a phone is already linked to an institution before attempting a
   * new link.
   *
   * @param {number|string} institutionId
   * @param {number|string} phoneId
   * @returns {Promise<Object>}
   */
  async getByInstitutionAndPhone(institutionId, phoneId) {

    if (!institutionId || !phoneId) {
      throw Boom.badRequest('Both an institution identifier and a phone identifier must be provided');
    }

    try {
      const theLink = await InstitutionPhone.findOne({
        where: { institutionId, phoneId },
        include: InstitutionPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('No link was found between the provided institution and phone');
      }

      return InstitutionPhoneServices._formatInstitutionPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the institution-phone link for the given institution and phone' });
    }
  }

  // ==========================================================
  // PRIVATE HELPERS (instance)
  // Naming convention: a leading underscore marks a method as
  // internal to this class and not meant to be called from
  // controllers. True '#private' class fields are intentionally
  // avoided to stay compatible with the ecmaVersion 12 (ES2021)
  // parser target declared in .eslintrc.json.
  // ==========================================================

  /**
   * Finds an InstitutionPhone record by its primary key.
   *
   * @private
   * @param {number|string} institutionPhoneId
   * @returns {Promise<InstitutionPhone|null>}
   */
  async _findById(institutionPhoneId) {
    return InstitutionPhone.findOne({ where: { id: institutionPhoneId } });
  }

  /**
   * Finds an InstitutionPhone record by its composite key
   * (institutionId + phoneId). Mirrors the database-level unique index.
   *
   * @private
   * @param {number|string} institutionId
   * @param {number|string} phoneId
   * @returns {Promise<InstitutionPhone|null>}
   */
  async _findByInstitutionAndPhone(institutionId, phoneId) {
    return InstitutionPhone.findOne({ where: { institutionId, phoneId } });
  }

  /**
   * Verifies that a referenced entity (Institution or Phone) exists.
   *
   * @private
   * @param {import('sequelize').ModelStatic} model
   * @param {number|string} id
   * @param {string} name
   * @throws {Boom}
   * @returns {Promise<void>}
   */
  async _assertExists(model, id, name) {
    const record = await model.findOne({ where: { id } });

    if (!record) {
      throw Boom.notFound(`${name} with id ${id} does not exist`);
    }
  }

  /**
   * Enforces the cross-bridge single-owner rule documented in
   * models/index.js: a given phone must not already be linked to any
   * OTHER owner (of any type). Since createOne has already ruled out a
   * duplicate link to the SAME institution, any link found here means
   * the phone belongs to a different actor entirely.
   *
   * @private
   * @param {number|string} phoneId - The phone being linked.
   * @param {number|string} requestingInstitutionId - The institution requesting the link.
   * @throws {Boom} - A conflict error naming the existing owner type.
   * @returns {Promise<void>}
   */
  async _assertPhoneIsAvailable(phoneId, requestingInstitutionId) {
    // Check InstitutionPhone for a DIFFERENT institution
    const otherInstitutionLink = await InstitutionPhone.findOne({ where: { phoneId } });

    if (otherInstitutionLink && Number(otherInstitutionLink.institutionId) !== Number(requestingInstitutionId)) {
      throw Boom.conflict('The phone is already linked to another institution');
    }

    // Check the other three ownership bridges
    const otherBridges = [
      { model: UserPhone, ownerLabel: 'a user' },
      { model: StudentPhone, ownerLabel: 'a student' },
      { model: CertificateRecipientPhone, ownerLabel: 'a certificate recipient' },
    ];

    for (const { model, ownerLabel } of otherBridges) {
      const existingLink = await model.findOne({ where: { phoneId } });

      if (existingLink) {
        throw Boom.conflict(`The phone is already linked to ${ownerLabel} and must be unlinked first`);
      }
    }
  }

  // ==========================================================
  // STATIC UTILITIES
  // Stateless helpers that do not depend on instance data, and are
  // therefore exposed as static methods. The ones prefixed with '_'
  // are intended strictly for internal use within this class (mirroring
  // the instance-method privacy convention), since ecmaVersion 12
  // (ES2021) does not support true private static members without
  // '#' fields.
  // ==========================================================

  /**
   * Sequelize include for the related Institution, exposing only the
   * fields needed to identify the institution without pulling in the
   * entire record (e.g. address, email, nit).
   *
   * @static
   */
  static INSTITUTION_INCLUDE = {
    model: Institution,
    as: 'institution',
    attributes: ['id', 'name', 'institutionalCode'],
  };

  /**
   * Sequelize include for the related Phone, exposing only the id and
   * number.
   *
   * @static
   */
  static PHONE_INCLUDE = {
    model: Phone,
    as: 'phone',
    attributes: ['id', 'number'],
  };

  /**
   * The set of Sequelize includes shared by every read method that
   * needs to embed the related institution and phone as nested objects
   * rather than raw foreign key integers.
   *
   * @static
   */
  static CATALOG_INCLUDES = [
    InstitutionPhoneServices.INSTITUTION_INCLUDE,
    InstitutionPhoneServices.PHONE_INCLUDE,
  ];

  /**
   * Reshapes an InstitutionPhone Sequelize instance (with its
   * 'institution' and 'phone' associations eagerly loaded via
   * CATALOG_INCLUDES) into a plain object where the raw
   * 'institutionId'/'phoneId' foreign keys are replaced by nested
   * { id, ... } objects.
   *
   * @private
   * @static
   * @param {InstitutionPhone} institutionPhone
   * @returns {Object}
   */
  static _formatInstitutionPhone(institutionPhone) {
    const { institutionId, phoneId, institution, phone, ...rest } = institutionPhone.toJSON();

    return {
      ...rest,
      institution: institution ?? null,
      phone: phone ?? null,
    };
  }
}

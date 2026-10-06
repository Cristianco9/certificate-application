// Import the UserPhone data model
import { UserPhone } from '../db/models/userPhone.js';
// Import related models to embed FK data as nested objects and to verify
// referential integrity before writing
import { User } from '../db/models/user.js';
import { Phone } from '../db/models/phone.js';
// Import the other three ownership bridge tables so this service can
// enforce the same cross-bridge "single owner per phone" rule documented
// in models/index.js and implemented by PhoneServices
import { StudentPhone } from '../db/models/studentPhone.js';
import { InstitutionPhone } from '../db/models/institutionPhone.js';
import { CertificateRecipientPhone } from '../db/models/certificateRecipientPhone.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the UserPhone (usuario_telefono) bridge entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * This bridge links a User to one of their Phone records. The database
 * enforces a composite unique index on (id_usuario, id_telefono), but
 * this service still checks that combination explicitly before writing,
 * per AGENTS.md section 6, so a duplicate link surfaces a clear
 * Boom.conflict instead of the raw ORM unique-constraint error.
 *
 * Additionally, this service enforces the cross-bridge invariant
 * documented in models/index.js: a given Phone row must only ever be
 * linked through ONE of the four bridge tables (UserPhone, StudentPhone,
 * InstitutionPhone, CertificateRecipientPhone), never more than one.
 * MySQL cannot express that exclusive-or across four tables
 * declaratively, so it is enforced here via _assertPhoneIsAvailable.
 *
 * Every method that returns a UserPhone record (listOne, listAll,
 * listByUser, listByPhone, getByUserAndPhone) embeds the related user
 * and phone as nested objects, rather than exposing the raw
 * 'userId'/'phoneId' foreign key integers.
 */
export class UserPhoneServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new UserPhone record, linking a phone to a user.
   *
   * @param {Object} newUserPhone
   * @param {number|string} newUserPhone.userId
   * @param {number|string} newUserPhone.phoneId
   * @returns {Promise<{status: string}>}
   */
  async createOne(newUserPhone) {

    try {
      // Verify the referenced user and phone actually exist before linking
      await this._assertExists(User, newUserPhone.userId, 'User');
      await this._assertExists(Phone, newUserPhone.phoneId, 'Phone');

      // Verify this exact link does not already exist, mirroring the
      // composite unique index defined at the database level
      const existingLink = await this._findByUserAndPhone(
        newUserPhone.userId, newUserPhone.phoneId
      );

      if (existingLink) {
        throw Boom.conflict('The phone is already linked to the provided user');
      }

      // Enforce the cross-bridge single-owner rule: the phone must not
      // already be linked to any other owner (user, student, institution,
      // or certificate recipient)
      await this._assertPhoneIsAvailable(newUserPhone.phoneId, newUserPhone.userId);

      // Create the record (id is generated automatically)
      await UserPhone.create({
        userId: newUserPhone.userId,
        phoneId: newUserPhone.phoneId,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to link the phone to the user in the database'
      });
    }
  }

  /**
   * Deletes a UserPhone record by its id.
   *
   * @param {number|string} userPhoneId
   * @returns {Promise<{status: string}>}
   */
  async deleteOne(userPhoneId) {

    if (!userPhoneId) {
      throw Boom.badRequest('No user-phone identifier was provided');
    }

    try {
      const existingLink = await this._findById(userPhoneId);

      if (!existingLink) {
        throw Boom.notFound('User-phone link not found');
      }

      const deletedRows = await UserPhone.destroy({
        where: { id: userPhoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('User-phone link not found');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the user in the database' });
    }
  }

  /**
   * Deletes a UserPhone record by its composite key (userId + phoneId).
   * Convenience equivalent of looking up the id first, then calling
   * deleteOne — matches the shape callers usually already have.
   *
   * @param {number|string} userId
   * @param {number|string} phoneId
   * @returns {Promise<{status: string}>}
   */
  async unlinkByUserAndPhone(userId, phoneId) {

    if (!userId || !phoneId) {
      throw Boom.badRequest('Both a user identifier and a phone identifier must be provided');
    }

    try {
      const deletedRows = await UserPhone.destroy({
        where: { userId, phoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('The phone is not currently linked to the provided user');
      }

      return { status: 'UNLINKED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the user in the database' });
    }
  }

  /**
   * Retrieves a single UserPhone record by its id, embedding its related
   * user and phone as nested objects.
   *
   * @param {number|string} userPhoneId
   * @returns {Promise<Object>}
   */
  async listOne(userPhoneId) {

    if (!userPhoneId) {
      throw Boom.badRequest('No user-phone identifier was provided');
    }

    try {
      const theLink = await UserPhone.findOne({
        where: { id: userPhoneId },
        include: UserPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('User-phone link not found');
      }

      return UserPhoneServices._formatUserPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the user-phone link' });
    }
  }

  /**
   * Retrieves all UserPhone records, ordered by id ascending, each with
   * its related user and phone embedded as nested objects.
   *
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listAll() {

    try {
      const allLinks = await UserPhone.findAll({
        order: [['id', 'ASC']],
        include: UserPhoneServices.CATALOG_INCLUDES,
      });

      const records = allLinks.map(UserPhoneServices._formatUserPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the user-phone links' });
    }
  }

  /**
   * Retrieves every UserPhone record belonging to a given user, each
   * with its related phone embedded as a nested object. This is the
   * primary lookup used to list all phones owned by a user.
   *
   * @param {number|string} userId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByUser(userId) {

    if (!userId) {
      throw Boom.badRequest('No user identifier was provided');
    }

    try {
      const linksByUser = await UserPhone.findAll({
        where: { userId },
        order: [['id', 'ASC']],
        include: UserPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByUser.map(UserPhoneServices._formatUserPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the user-phone links for the given user' });
    }
  }

  /**
   * Retrieves every UserPhone record referencing a given phone, each
   * with its related user embedded as a nested object. In practice this
   * returns at most one record, since the cross-bridge single-owner
   * rule limits a phone to a single owner overall.
   *
   * @param {number|string} phoneId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByPhone(phoneId) {

    if (!phoneId) {
      throw Boom.badRequest('No phone identifier was provided');
    }

    try {
      const linksByPhone = await UserPhone.findAll({
        where: { phoneId },
        order: [['id', 'ASC']],
        include: UserPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByPhone.map(UserPhoneServices._formatUserPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the user-phone links for the given phone' });
    }
  }

  /**
   * Retrieves the single UserPhone record (if any) linking a specific
   * user to a specific phone. Useful to check whether a phone is
   * already linked to a user before attempting a new link.
   *
   * @param {number|string} userId
   * @param {number|string} phoneId
   * @returns {Promise<Object>}
   */
  async getByUserAndPhone(userId, phoneId) {

    if (!userId || !phoneId) {
      throw Boom.badRequest('Both a user identifier and a phone identifier must be provided');
    }

    try {
      const theLink = await UserPhone.findOne({
        where: { userId, phoneId },
        include: UserPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('No link was found between the provided user and phone');
      }

      return UserPhoneServices._formatUserPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the user-phone link for the given user and phone' });
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
   * Finds a UserPhone record by its primary key.
   *
   * @private
   * @param {number|string} userPhoneId
   * @returns {Promise<UserPhone|null>}
   */
  async _findById(userPhoneId) {
    return UserPhone.findOne({ where: { id: userPhoneId } });
  }

  /**
   * Finds a UserPhone record by its composite key (userId + phoneId).
   * Mirrors the database-level unique index.
   *
   * @private
   * @param {number|string} userId
   * @param {number|string} phoneId
   * @returns {Promise<UserPhone|null>}
   */
  async _findByUserAndPhone(userId, phoneId) {
    return UserPhone.findOne({ where: { userId, phoneId } });
  }

  /**
   * Verifies that a referenced entity (User or Phone) exists.
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
   * duplicate link to the SAME user, any link found here means the
   * phone belongs to a different actor entirely.
   *
   * @private
   * @param {number|string} phoneId - The phone being linked.
   * @param {number|string} requestingUserId - The user requesting the link.
   * @throws {Boom} - A conflict error naming the existing owner type.
   * @returns {Promise<void>}
   */
  async _assertPhoneIsAvailable(phoneId, requestingUserId) {
    // Check UserPhone for a DIFFERENT user
    const otherUserLink = await UserPhone.findOne({ where: { phoneId } });

    if (otherUserLink && Number(otherUserLink.userId) !== Number(requestingUserId)) {
      throw Boom.conflict('The phone is already linked to another user');
    }

    // Check the other three ownership bridges
    const otherBridges = [
      { model: StudentPhone, ownerLabel: 'a student' },
      { model: InstitutionPhone, ownerLabel: 'an institution' },
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
   * Sequelize include for the related User, exposing only the fields
   * needed to identify the user without pulling in the entire record
   * (e.g. password, address).
   *
   * @static
   */
  static USER_INCLUDE = {
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'firstName', 'lastName'],
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
   * needs to embed the related user and phone as nested objects rather
   * than raw foreign key integers.
   *
   * @static
   */
  static CATALOG_INCLUDES = [
    UserPhoneServices.USER_INCLUDE,
    UserPhoneServices.PHONE_INCLUDE,
  ];

  /**
   * Reshapes a UserPhone Sequelize instance (with its 'user' and 'phone'
   * associations eagerly loaded via CATALOG_INCLUDES) into a plain
   * object where the raw 'userId'/'phoneId' foreign keys are replaced
   * by nested { id, ... } objects.
   *
   * @private
   * @static
   * @param {UserPhone} userPhone
   * @returns {Object}
   */
  static _formatUserPhone(userPhone) {
    const { userId, phoneId, user, phone, ...rest } = userPhone.toJSON();

    return {
      ...rest,
      user: user ?? null,
      phone: phone ?? null,
    };
  }
}

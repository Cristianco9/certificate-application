// Import the CertificateRecipientPhone data model
import { CertificateRecipientPhone } from '../db/models/certificateRecipientPhone.js';
// Import related models to embed FK data as nested objects and to verify
// referential integrity before writing
import { CertificateRecipient } from '../db/models/certificateRecipient.js';
import { Phone } from '../db/models/phone.js';
// Import the other three ownership bridge tables so this service can
// enforce the same cross-bridge "single owner per phone" rule documented
// in models/index.js and implemented by PhoneServices
import { UserPhone } from '../db/models/userPhone.js';
import { StudentPhone } from '../db/models/studentPhone.js';
import { InstitutionPhone } from '../db/models/institutionPhone.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the CertificateRecipientPhone
 * (receptor_certificado_telefono) bridge entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * This bridge links a CertificateRecipient to one of their Phone
 * records. The database enforces a composite unique index on
 * (id_receptor_certificado, id_telefono), but this service still checks
 * that combination explicitly before writing, per AGENTS.md section 6,
 * so a duplicate link surfaces a clear Boom.conflict instead of the raw
 * ORM unique-constraint error.
 *
 * Additionally, this service enforces the cross-bridge invariant
 * documented in models/index.js: a given Phone row must only ever be
 * linked through ONE of the four bridge tables (UserPhone, StudentPhone,
 * InstitutionPhone, CertificateRecipientPhone), never more than one.
 * MySQL cannot express that exclusive-or across four tables
 * declaratively, so it is enforced here via _assertPhoneIsAvailable.
 *
 * Every method that returns a CertificateRecipientPhone record
 * (listOne, listAll, listByCertificateRecipient, listByPhone,
 * getByCertificateRecipientAndPhone) embeds the related certificate
 * recipient and phone as nested objects, rather than exposing the raw
 * 'certificateRecipientId'/'phoneId' foreign key integers.
 */
export class CertificateRecipientPhoneServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new CertificateRecipientPhone record, linking a phone to
   * a certificate recipient.
   *
   * @param {Object} newCertificateRecipientPhone
   * @param {number|string} newCertificateRecipientPhone.certificateRecipientId
   * @param {number|string} newCertificateRecipientPhone.phoneId
   * @returns {Promise<{status: string}>}
   */
  async createOne(newCertificateRecipientPhone) {

    try {
      // Verify the referenced certificate recipient and phone actually
      // exist before linking them
      await this._assertExists(
        CertificateRecipient,
        newCertificateRecipientPhone.certificateRecipientId,
        'CertificateRecipient'
      );
      await this._assertExists(Phone, newCertificateRecipientPhone.phoneId, 'Phone');

      // Verify this exact link does not already exist, mirroring the
      // composite unique index defined at the database level
      const existingLink = await this._findByCertificateRecipientAndPhone(
        newCertificateRecipientPhone.certificateRecipientId,
        newCertificateRecipientPhone.phoneId
      );

      if (existingLink) {
        throw Boom.conflict('The phone is already linked to the provided certificate recipient');
      }

      // Enforce the cross-bridge single-owner rule: the phone must not
      // already be linked to any other owner (user, student, institution,
      // or another certificate recipient)
      await this._assertPhoneIsAvailable(
        newCertificateRecipientPhone.phoneId,
        newCertificateRecipientPhone.certificateRecipientId
      );

      // Create the record (id is generated automatically)
      await CertificateRecipientPhone.create({
        certificateRecipientId: newCertificateRecipientPhone.certificateRecipientId,
        phoneId: newCertificateRecipientPhone.phoneId,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to link the phone to the certificate recipient in the database'
      });
    }
  }

  /**
   * Deletes a CertificateRecipientPhone record by its id.
   *
   * @param {number|string} certificateRecipientPhoneId
   * @returns {Promise<{status: string}>}
   */
  async deleteOne(certificateRecipientPhoneId) {

    if (!certificateRecipientPhoneId) {
      throw Boom.badRequest('No certificate-recipient-phone identifier was provided');
    }

    try {
      const existingLink = await this._findById(certificateRecipientPhoneId);

      if (!existingLink) {
        throw Boom.notFound('Certificate-recipient-phone link not found');
      }

      const deletedRows = await CertificateRecipientPhone.destroy({
        where: { id: certificateRecipientPhoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Certificate-recipient-phone link not found');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the certificate recipient in the database' });
    }
  }

  /**
   * Deletes a CertificateRecipientPhone record by its composite key
   * (certificateRecipientId + phoneId). Convenience equivalent of
   * looking up the id first, then calling deleteOne.
   *
   * @param {number|string} certificateRecipientId
   * @param {number|string} phoneId
   * @returns {Promise<{status: string}>}
   */
  async unlinkByCertificateRecipientAndPhone(certificateRecipientId, phoneId) {

    if (!certificateRecipientId || !phoneId) {
      throw Boom.badRequest('Both a certificate recipient identifier and a phone identifier must be provided');
    }

    try {
      const deletedRows = await CertificateRecipientPhone.destroy({
        where: { certificateRecipientId, phoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('The phone is not currently linked to the provided certificate recipient');
      }

      return { status: 'UNLINKED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the certificate recipient in the database' });
    }
  }

  /**
   * Retrieves a single CertificateRecipientPhone record by its id,
   * embedding its related certificate recipient and phone as nested
   * objects.
   *
   * @param {number|string} certificateRecipientPhoneId
   * @returns {Promise<Object>}
   */
  async listOne(certificateRecipientPhoneId) {

    if (!certificateRecipientPhoneId) {
      throw Boom.badRequest('No certificate-recipient-phone identifier was provided');
    }

    try {
      const theLink = await CertificateRecipientPhone.findOne({
        where: { id: certificateRecipientPhoneId },
        include: CertificateRecipientPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('Certificate-recipient-phone link not found');
      }

      return CertificateRecipientPhoneServices._formatCertificateRecipientPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificate-recipient-phone link' });
    }
  }

  /**
   * Retrieves all CertificateRecipientPhone records, ordered by id
   * ascending, each with its related certificate recipient and phone
   * embedded as nested objects.
   *
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listAll() {

    try {
      const allLinks = await CertificateRecipientPhone.findAll({
        order: [['id', 'ASC']],
        include: CertificateRecipientPhoneServices.CATALOG_INCLUDES,
      });

      const records = allLinks.map(CertificateRecipientPhoneServices._formatCertificateRecipientPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificate-recipient-phone links' });
    }
  }

  /**
   * Retrieves every CertificateRecipientPhone record belonging to a
   * given certificate recipient, each with its related phone embedded
   * as a nested object. This is the primary lookup used to list all
   * phones owned by a certificate recipient.
   *
   * @param {number|string} certificateRecipientId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByCertificateRecipient(certificateRecipientId) {

    if (!certificateRecipientId) {
      throw Boom.badRequest('No certificate recipient identifier was provided');
    }

    try {
      const linksByCertificateRecipient = await CertificateRecipientPhone.findAll({
        where: { certificateRecipientId },
        order: [['id', 'ASC']],
        include: CertificateRecipientPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByCertificateRecipient.map(
        CertificateRecipientPhoneServices._formatCertificateRecipientPhone
      );

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to find the certificate-recipient-phone links for the given certificate recipient'
      });
    }
  }

  /**
   * Retrieves every CertificateRecipientPhone record referencing a given
   * phone, each with its related certificate recipient embedded as a
   * nested object. In practice this returns at most one record, since
   * the cross-bridge single-owner rule limits a phone to a single owner
   * overall.
   *
   * @param {number|string} phoneId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByPhone(phoneId) {

    if (!phoneId) {
      throw Boom.badRequest('No phone identifier was provided');
    }

    try {
      const linksByPhone = await CertificateRecipientPhone.findAll({
        where: { phoneId },
        order: [['id', 'ASC']],
        include: CertificateRecipientPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByPhone.map(
        CertificateRecipientPhoneServices._formatCertificateRecipientPhone
      );

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to find the certificate-recipient-phone links for the given phone'
      });
    }
  }

  /**
   * Retrieves the single CertificateRecipientPhone record (if any)
   * linking a specific certificate recipient to a specific phone.
   * Useful to check whether a phone is already linked to a certificate
   * recipient before attempting a new link.
   *
   * @param {number|string} certificateRecipientId
   * @param {number|string} phoneId
   * @returns {Promise<Object>}
   */
  async getByCertificateRecipientAndPhone(certificateRecipientId, phoneId) {

    if (!certificateRecipientId || !phoneId) {
      throw Boom.badRequest('Both a certificate recipient identifier and a phone identifier must be provided');
    }

    try {
      const theLink = await CertificateRecipientPhone.findOne({
        where: { certificateRecipientId, phoneId },
        include: CertificateRecipientPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('No link was found between the provided certificate recipient and phone');
      }

      return CertificateRecipientPhoneServices._formatCertificateRecipientPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to find the certificate-recipient-phone link for the given certificate recipient and phone'
      });
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
   * Finds a CertificateRecipientPhone record by its primary key.
   *
   * @private
   * @param {number|string} certificateRecipientPhoneId
   * @returns {Promise<CertificateRecipientPhone|null>}
   */
  async _findById(certificateRecipientPhoneId) {
    return CertificateRecipientPhone.findOne({ where: { id: certificateRecipientPhoneId } });
  }

  /**
   * Finds a CertificateRecipientPhone record by its composite key
   * (certificateRecipientId + phoneId). Mirrors the database-level
   * unique index.
   *
   * @private
   * @param {number|string} certificateRecipientId
   * @param {number|string} phoneId
   * @returns {Promise<CertificateRecipientPhone|null>}
   */
  async _findByCertificateRecipientAndPhone(certificateRecipientId, phoneId) {
    return CertificateRecipientPhone.findOne({ where: { certificateRecipientId, phoneId } });
  }

  /**
   * Verifies that a referenced entity (CertificateRecipient or Phone)
   * exists.
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
   * duplicate link to the SAME certificate recipient, any link found
   * here means the phone belongs to a different actor entirely.
   *
   * @private
   * @param {number|string} phoneId - The phone being linked.
   * @param {number|string} requestingCertificateRecipientId - The certificate recipient requesting the link.
   * @throws {Boom} - A conflict error naming the existing owner type.
   * @returns {Promise<void>}
   */
  async _assertPhoneIsAvailable(phoneId, requestingCertificateRecipientId) {
    // Check CertificateRecipientPhone for a DIFFERENT certificate recipient
    const otherCertificateRecipientLink = await CertificateRecipientPhone.findOne({ where: { phoneId } });

    if (
      otherCertificateRecipientLink &&
      Number(otherCertificateRecipientLink.certificateRecipientId) !== Number(requestingCertificateRecipientId)
    ) {
      throw Boom.conflict('The phone is already linked to another certificate recipient');
    }

    // Check the other three ownership bridges
    const otherBridges = [
      { model: UserPhone, ownerLabel: 'a user' },
      { model: StudentPhone, ownerLabel: 'a student' },
      { model: InstitutionPhone, ownerLabel: 'an institution' },
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
   * Sequelize include for the related CertificateRecipient, exposing
   * only the fields needed to identify the recipient without pulling in
   * the entire record (e.g. address).
   *
   * @static
   */
  static CERTIFICATE_RECIPIENT_INCLUDE = {
    model: CertificateRecipient,
    as: 'certificateRecipient',
    attributes: ['id', 'firstName', 'middleName', 'lastName', 'secondLastName', 'documentNumber'],
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
   * needs to embed the related certificate recipient and phone as
   * nested objects rather than raw foreign key integers.
   *
   * @static
   */
  static CATALOG_INCLUDES = [
    CertificateRecipientPhoneServices.CERTIFICATE_RECIPIENT_INCLUDE,
    CertificateRecipientPhoneServices.PHONE_INCLUDE,
  ];

  /**
   * Reshapes a CertificateRecipientPhone Sequelize instance (with its
   * 'certificateRecipient' and 'phone' associations eagerly loaded via
   * CATALOG_INCLUDES) into a plain object where the raw
   * 'certificateRecipientId'/'phoneId' foreign keys are replaced by
   * nested { id, ... } objects.
   *
   * @private
   * @static
   * @param {CertificateRecipientPhone} certificateRecipientPhone
   * @returns {Object}
   */
  static _formatCertificateRecipientPhone(certificateRecipientPhone) {
    const { certificateRecipientId, phoneId, certificateRecipient, phone, ...rest } =
      certificateRecipientPhone.toJSON();

    return {
      ...rest,
      certificateRecipient: certificateRecipient ?? null,
      phone: phone ?? null,
    };
  }
}

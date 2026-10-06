// Import the StudentPhone data model
import { StudentPhone } from '../db/models/studentPhone.js';
// Import related models to embed FK data as nested objects and to verify
// referential integrity before writing
import { Student } from '../db/models/student.js';
import { Phone } from '../db/models/phone.js';
// Import the other three ownership bridge tables so this service can
// enforce the same cross-bridge "single owner per phone" rule documented
// in models/index.js and implemented by PhoneServices
import { UserPhone } from '../db/models/userPhone.js';
import { InstitutionPhone } from '../db/models/institutionPhone.js';
import { CertificateRecipientPhone } from '../db/models/certificateRecipientPhone.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the StudentPhone (estudiante_telefono) bridge
 * entity.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * This bridge links a Student to one of their Phone records. The
 * database enforces a composite unique index on
 * (id_estudiante, id_telefono), but this service still checks that
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
 * Every method that returns a StudentPhone record (listOne, listAll,
 * listByStudent, listByPhone, getByStudentAndPhone) embeds the related
 * student and phone as nested objects, rather than exposing the raw
 * 'studentId'/'phoneId' foreign key integers.
 */
export class StudentPhoneServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Creates a new StudentPhone record, linking a phone to a student.
   *
   * @param {Object} newStudentPhone
   * @param {number|string} newStudentPhone.studentId
   * @param {number|string} newStudentPhone.phoneId
   * @returns {Promise<{status: string}>}
   */
  async createOne(newStudentPhone) {

    try {
      // Verify the referenced student and phone actually exist before
      // linking them
      await this._assertExists(Student, newStudentPhone.studentId, 'Student');
      await this._assertExists(Phone, newStudentPhone.phoneId, 'Phone');

      // Verify this exact link does not already exist, mirroring the
      // composite unique index defined at the database level
      const existingLink = await this._findByStudentAndPhone(
        newStudentPhone.studentId, newStudentPhone.phoneId
      );

      if (existingLink) {
        throw Boom.conflict('The phone is already linked to the provided student');
      }

      // Enforce the cross-bridge single-owner rule: the phone must not
      // already be linked to any other owner (user, student, institution,
      // or certificate recipient)
      await this._assertPhoneIsAvailable(newStudentPhone.phoneId, newStudentPhone.studentId);

      // Create the record (id is generated automatically)
      await StudentPhone.create({
        studentId: newStudentPhone.studentId,
        phoneId: newStudentPhone.phoneId,
      });

      return { status: 'CREATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to link the phone to the student in the database'
      });
    }
  }

  /**
   * Deletes a StudentPhone record by its id.
   *
   * @param {number|string} studentPhoneId
   * @returns {Promise<{status: string}>}
   */
  async deleteOne(studentPhoneId) {

    if (!studentPhoneId) {
      throw Boom.badRequest('No student-phone identifier was provided');
    }

    try {
      const existingLink = await this._findById(studentPhoneId);

      if (!existingLink) {
        throw Boom.notFound('Student-phone link not found');
      }

      const deletedRows = await StudentPhone.destroy({
        where: { id: studentPhoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Student-phone link not found');
      }

      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the student in the database' });
    }
  }

  /**
   * Deletes a StudentPhone record by its composite key (studentId +
   * phoneId). Convenience equivalent of looking up the id first, then
   * calling deleteOne — matches the shape callers usually already have.
   *
   * @param {number|string} studentId
   * @param {number|string} phoneId
   * @returns {Promise<{status: string}>}
   */
  async unlinkByStudentAndPhone(studentId, phoneId) {

    if (!studentId || !phoneId) {
      throw Boom.badRequest('Both a student identifier and a phone identifier must be provided');
    }

    try {
      const deletedRows = await StudentPhone.destroy({
        where: { studentId, phoneId }
      });

      if (!deletedRows) {
        throw Boom.notFound('The phone is not currently linked to the provided student');
      }

      return { status: 'UNLINKED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to unlink the phone from the student in the database' });
    }
  }

  /**
   * Retrieves a single StudentPhone record by its id, embedding its
   * related student and phone as nested objects.
   *
   * @param {number|string} studentPhoneId
   * @returns {Promise<Object>}
   */
  async listOne(studentPhoneId) {

    if (!studentPhoneId) {
      throw Boom.badRequest('No student-phone identifier was provided');
    }

    try {
      const theLink = await StudentPhone.findOne({
        where: { id: studentPhoneId },
        include: StudentPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('Student-phone link not found');
      }

      return StudentPhoneServices._formatStudentPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the student-phone link' });
    }
  }

  /**
   * Retrieves all StudentPhone records, ordered by id ascending, each
   * with its related student and phone embedded as nested objects.
   *
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listAll() {

    try {
      const allLinks = await StudentPhone.findAll({
        order: [['id', 'ASC']],
        include: StudentPhoneServices.CATALOG_INCLUDES,
      });

      const records = allLinks.map(StudentPhoneServices._formatStudentPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the student-phone links' });
    }
  }

  /**
   * Retrieves every StudentPhone record belonging to a given student,
   * each with its related phone embedded as a nested object. This is
   * the primary lookup used to list all phones owned by a student.
   *
   * @param {number|string} studentId
   * @returns {Promise<{total: number, records: Object[]}>}
   */
  async listByStudent(studentId) {

    if (!studentId) {
      throw Boom.badRequest('No student identifier was provided');
    }

    try {
      const linksByStudent = await StudentPhone.findAll({
        where: { studentId },
        order: [['id', 'ASC']],
        include: StudentPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByStudent.map(StudentPhoneServices._formatStudentPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the student-phone links for the given student' });
    }
  }

  /**
   * Retrieves every StudentPhone record referencing a given phone, each
   * with its related student embedded as a nested object. In practice
   * this returns at most one record, since the cross-bridge single-owner
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
      const linksByPhone = await StudentPhone.findAll({
        where: { phoneId },
        order: [['id', 'ASC']],
        include: StudentPhoneServices.CATALOG_INCLUDES,
      });

      const records = linksByPhone.map(StudentPhoneServices._formatStudentPhone);

      return { total: records.length, records };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the student-phone links for the given phone' });
    }
  }

  /**
   * Retrieves the single StudentPhone record (if any) linking a specific
   * student to a specific phone. Useful to check whether a phone is
   * already linked to a student before attempting a new link.
   *
   * @param {number|string} studentId
   * @param {number|string} phoneId
   * @returns {Promise<Object>}
   */
  async getByStudentAndPhone(studentId, phoneId) {

    if (!studentId || !phoneId) {
      throw Boom.badRequest('Both a student identifier and a phone identifier must be provided');
    }

    try {
      const theLink = await StudentPhone.findOne({
        where: { studentId, phoneId },
        include: StudentPhoneServices.CATALOG_INCLUDES,
      });

      if (!theLink) {
        throw Boom.notFound('No link was found between the provided student and phone');
      }

      return StudentPhoneServices._formatStudentPhone(theLink);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the student-phone link for the given student and phone' });
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
   * Finds a StudentPhone record by its primary key.
   *
   * @private
   * @param {number|string} studentPhoneId
   * @returns {Promise<StudentPhone|null>}
   */
  async _findById(studentPhoneId) {
    return StudentPhone.findOne({ where: { id: studentPhoneId } });
  }

  /**
   * Finds a StudentPhone record by its composite key (studentId + phoneId).
   * Mirrors the database-level unique index.
   *
   * @private
   * @param {number|string} studentId
   * @param {number|string} phoneId
   * @returns {Promise<StudentPhone|null>}
   */
  async _findByStudentAndPhone(studentId, phoneId) {
    return StudentPhone.findOne({ where: { studentId, phoneId } });
  }

  /**
   * Verifies that a referenced entity (Student or Phone) exists.
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
   * duplicate link to the SAME student, any link found here means the
   * phone belongs to a different actor entirely.
   *
   * @private
   * @param {number|string} phoneId - The phone being linked.
   * @param {number|string} requestingStudentId - The student requesting the link.
   * @throws {Boom} - A conflict error naming the existing owner type.
   * @returns {Promise<void>}
   */
  async _assertPhoneIsAvailable(phoneId, requestingStudentId) {
    // Check StudentPhone for a DIFFERENT student
    const otherStudentLink = await StudentPhone.findOne({ where: { phoneId } });

    if (otherStudentLink && Number(otherStudentLink.studentId) !== Number(requestingStudentId)) {
      throw Boom.conflict('The phone is already linked to another student');
    }

    // Check the other three ownership bridges
    const otherBridges = [
      { model: UserPhone, ownerLabel: 'a user' },
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
   * Sequelize include for the related Student, exposing only the fields
   * needed to identify the student without pulling in the entire record
   * (e.g. address, email, birthDate).
   *
   * @static
   */
  static STUDENT_INCLUDE = {
    model: Student,
    as: 'student',
    attributes: ['id', 'firstName', 'middleName', 'firstLastName', 'secondLastName', 'documentNumber'],
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
   * needs to embed the related student and phone as nested objects
   * rather than raw foreign key integers.
   *
   * @static
   */
  static CATALOG_INCLUDES = [
    StudentPhoneServices.STUDENT_INCLUDE,
    StudentPhoneServices.PHONE_INCLUDE,
  ];

  /**
   * Reshapes a StudentPhone Sequelize instance (with its 'student' and
   * 'phone' associations eagerly loaded via CATALOG_INCLUDES) into a
   * plain object where the raw 'studentId'/'phoneId' foreign keys are
   * replaced by nested { id, ... } objects.
   *
   * @private
   * @static
   * @param {StudentPhone} studentPhone
   * @returns {Object}
   */
  static _formatStudentPhone(studentPhone) {
    const { studentId, phoneId, student, phone, ...rest } = studentPhone.toJSON();

    return {
      ...rest,
      student: student ?? null,
      phone: phone ?? null,
    };
  }
}

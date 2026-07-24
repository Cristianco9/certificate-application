// Import the Certificate data model
import { Certificate } from '../db/models/certificate.js';
// Import the CertificateSignature model to enforce the delete-guard business rule
import { CertificateSignature } from '../db/models/certificateSignature.js';
// Import the Sequelize operators to build advanced query conditions
import { Op } from 'sequelize';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Service class responsible for all business logic and database
 * operations related to the Certificate (certificado) entity — the
 * central entity of the system described in context.md.
 *
 * Follows the Repository/Service Layer pattern described in AGENTS.md:
 * controllers never talk to Sequelize directly, they always go through
 * this class. Every public method returns an explicit status object
 * (or the requested record) instead of a bare boolean, so the
 * controller decides the proper HTTP response from that status.
 *
 * Important domain rules encoded here (see context.md, 'Generación del
 * Certificado' and 'Reimpresión'):
 *   - The certificate never stores scores; it only references an
 *     Enrollment. Score data is assembled separately via JOINs when the
 *     document is rendered — that assembly is out of this service's
 *     scope (it belongs to a rendering/reporting layer), but is called
 *     out here so the boundary is explicit.
 *   - 'id_matricula_certificado' is unique at the database level: an
 *     enrollment can only ever have ONE certificate. createOne enforces
 *     this with a friendly Boom error before hitting the raw unique
 *     constraint.
 *   - A certificate must never be regenerated once issued. Reprinting
 *     reuses the same record via reprint(), rather than createOne
 *     being called again for the same enrollment.
 *   - Status transitions are intentionally NOT exposed through the
 *     generic updateOne, since 'EMITIDO' -> 'REIMPRESO' -> 'ANULADO'
 *     are meaningful business events with their own audit trail
 *     requirements (see context.md, 'Auditoría'). They are handled by
 *     the dedicated reprint() and voidOne() methods instead.
 */
export class CertificateServices {

  // ==========================================================
  // PUBLIC METHODS (instance)
  // ==========================================================

  /**
   * Issues a new certificate for a given enrollment. The act/record
   * number is generated automatically as a system consecutive (see
   * context.md, 'Generación del Certificado', step 6) — callers must
   * not supply one.
   *
   * @param {Object} newCertificate
   * @param {string} newCertificate.issueDate
   * @param {number} newCertificate.userId - The id of the staff member issuing the certificate.
   * @param {number} newCertificate.institutionId
   * @param {number} newCertificate.enrollmentId
   * @param {number} [newCertificate.recipientId]
   * @returns {Promise<{status: string, actNumber: string}>}
   */
  async createOne(newCertificate) {

    try {

      // Enforce the one-certificate-per-enrollment business rule before
      // touching the database, giving a clearer error than the raw
      // unique constraint on 'id_matricula_certificado'
      const existingCertificateForEnrollment = await this._findByEnrollment(newCertificate.enrollmentId);

      if (existingCertificateForEnrollment) {
        throw Boom.conflict('A certificate has already been issued for this enrollment; use reprint instead of issuing a new one');
      }

      // Generate the next consecutive act number for the current year
      const generatedActNumber = await this._generateNextActNumber();

      // Create the record (id is generated automatically)
      await Certificate.create({
        actNumber: generatedActNumber,
        issueDate: newCertificate.issueDate,
        userId: newCertificate.userId,
        institutionId: newCertificate.institutionId,
        enrollmentId: newCertificate.enrollmentId,
        recipientId: newCertificate.recipientId,
        status: CertificateServices.STATUS.ISSUED,
      });

      return { status: 'CREATED SUCCESSFULLY', actNumber: generatedActNumber };

    } catch (error) {
      throw Boom.boomify(error, {
        message: 'Unable to create the certificate in the database'
      });
    }
  }

  /**
   * Updates the non-essential, correctable fields of an existing
   * certificate. The act number, issue date, issuing user, enrollment,
   * and status are intentionally not editable here: the first four are
   * immutable historical facts once a certificate is issued, and status
   * transitions must go through reprint() or voidOne() to preserve the
   * audit trail.
   *
   * @param {number} certificateId - The id of the certificate to update.
   * @param {Object} newCertificateData - The new data to persist.
   * @param {number} [newCertificateData.institutionId] - A corrected issuing institution, if needed.
   * @param {number} [newCertificateData.recipientId] - The recipient who will collect the document.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async updateOne(certificateId, newCertificateData) {

    if (!newCertificateData) {
      throw Boom.badRequest('No data was provided to update');
    }

    // Reject attempts to change immutable or audit-controlled fields
    // through this generic method
    const forbiddenFields = ['actNumber', 'issueDate', 'userId', 'enrollmentId', 'status'];
    const attemptedForbiddenField = forbiddenFields.find((field) =>
      Object.prototype.hasOwnProperty.call(newCertificateData, field)
    );

    if (attemptedForbiddenField) {
      throw Boom.badRequest(`The field '${attemptedForbiddenField}' cannot be changed through a generic update`);
    }

    try {
      // Verify the certificate exists before attempting the update
      const existingCertificate = await this._findById(certificateId);

      if (!existingCertificate) {
        throw Boom.notFound('Certificate not found');
      }

      // A voided certificate is a terminal record and should not be
      // altered further
      if (existingCertificate.status === CertificateServices.STATUS.VOIDED) {
        throw Boom.conflict('A voided certificate cannot be updated');
      }

      // Update the record in the database
      const [updatedRows] = await Certificate.update(
        {
          institutionId: newCertificateData.institutionId,
          recipientId: newCertificateData.recipientId,
        },
        {
          where: { id: certificateId }
        }
      );

      // If no rows were updated, return an error
      if (!updatedRows) {
        throw Boom.notFound('Certificate not found');
      }

      // Return a success response
      return { status: 'UPDATED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to update the certificate in the database' });
    }
  }

  /**
   * Marks a certificate as reprinted. Per context.md ('Reimpresión'),
   * a certificate must never be regenerated: this method locates the
   * existing record, verifies it can still be printed, and moves its
   * status to REIMPRESO so the reprint event is reflected in the audit
   * trail, without creating a new Certificate row or touching its
   * original act number.
   *
   * @param {number} certificateId - The id of the certificate to reprint.
   * @returns {Promise<Certificate>} - The certificate record, ready to be handed back for printing.
   */
  async reprint(certificateId) {

    if (!certificateId) {
      throw Boom.badRequest('No certificate identifier was provided');
    }

    try {
      const existingCertificate = await this._findById(certificateId);

      if (!existingCertificate) {
        throw Boom.notFound('Certificate not found');
      }

      if (existingCertificate.status === CertificateServices.STATUS.VOIDED) {
        throw Boom.conflict('A voided certificate cannot be reprinted');
      }

      await Certificate.update(
        { status: CertificateServices.STATUS.REPRINTED },
        { where: { id: certificateId } }
      );

      return this._findById(certificateId);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to reprint the certificate' });
    }
  }

  /**
   * Voids a certificate, marking it as no longer valid. This is a
   * terminal, irreversible business action distinct from a generic
   * update, kept as its own method for the same audit-trail reasons
   * described in the class JSDoc.
   *
   * @param {number} certificateId - The id of the certificate to void.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async voidOne(certificateId) {

    if (!certificateId) {
      throw Boom.badRequest('No certificate identifier was provided');
    }

    try {
      const existingCertificate = await this._findById(certificateId);

      if (!existingCertificate) {
        throw Boom.notFound('Certificate not found');
      }

      if (existingCertificate.status === CertificateServices.STATUS.VOIDED) {
        throw Boom.conflict('The certificate is already voided');
      }

      await Certificate.update(
        { status: CertificateServices.STATUS.VOIDED },
        { where: { id: certificateId } }
      );

      return { status: 'VOIDED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to void the certificate' });
    }
  }

  /**
   * Deletes a certificate record, provided it has no associated
   * signatures. Note: for normal cancellation workflows, voidOne()
   * should be preferred over hard deletion, since context.md requires
   * full traceability of issued certificates ('Ausencia de
   * trazabilidad sobre certificados expedidos' is explicitly listed as
   * a problem this system must solve). deleteOne remains available for
   * correcting erroneous records that were never signed or printed.
   *
   * @param {number} certificateId - The id of the certificate to delete.
   * @returns {Promise<{status: string}>} - A status object describing the outcome.
   */
  async deleteOne(certificateId) {

    if (!certificateId) {
      throw Boom.badRequest('No certificate identifier was provided');
    }

    try {
      // Verify the certificate exists before attempting the deletion
      const existingCertificate = await this._findById(certificateId);

      if (!existingCertificate) {
        throw Boom.notFound('Certificate not found');
      }

      // Prevent deletion if the certificate still has associated
      // signatures, giving a clearer error than the raw RESTRICT
      // constraint from MySQL
      await this._assertNoAssociatedSignatures(certificateId);

      // Destroy the record in the database
      const deletedRows = await Certificate.destroy({
        where: { id: certificateId }
      });

      if (!deletedRows) {
        throw Boom.notFound('Certificate not found');
      }

      // Return a success response
      return { status: 'DELETED SUCCESSFULLY' };

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to delete the certificate from the database' });
    }
  }

  /**
   * Retrieves a single certificate by its id.
   *
   * @param {number} certificateId - The id of the certificate to retrieve.
   * @returns {Promise<Certificate>} - The certificate record.
   */
  async listOne(certificateId) {

    if (!certificateId) {
      throw Boom.badRequest('No certificate identifier was provided');
    }

    try {
      const theCertificate = await this._findById(certificateId);

      if (!theCertificate) {
        throw Boom.notFound('Certificate not found');
      }

      return theCertificate;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificate' });
    }
  }

  /**
   * Retrieves all certificate records, ordered from most to least
   * recently issued.
   *
   * @returns {Promise<Certificate[]>} - The list of certificate records.
   */
  async listAll() {

    try {
      const allCertificates = await Certificate.findAll({
        order: [['issueDate', 'DESC']]
      });

      return allCertificates;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificates' });
    }
  }

  /**
   * Retrieves a single certificate by its exact act/record number.
   * Supports the 'Buscar el certificado' step of the reprint flow
   * described in context.md.
   *
   * @param {string} actNumber - The act number to search for.
   * @returns {Promise<Certificate>} - The matching certificate record.
   */
  async listByActNumber(actNumber) {

    if (!actNumber) {
      throw Boom.badRequest('No act number was provided');
    }

    try {
      const theCertificate = await this._findByActNumber(actNumber);

      if (!theCertificate) {
        throw Boom.notFound('Certificate not found with the provided act number');
      }

      return theCertificate;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificate by its act number' });
    }
  }

  /**
   * Retrieves the certificate issued for a given enrollment, if any.
   * Since 'enrollmentId' is unique, at most one certificate can exist
   * per enrollment.
   *
   * @param {number} enrollmentId - The id of the enrollment.
   * @returns {Promise<Certificate|null>} - The matching certificate record, or null if none has been issued yet.
   */
  async listByEnrollment(enrollmentId) {

    if (!enrollmentId) {
      throw Boom.badRequest('No enrollment identifier was provided');
    }

    try {
      return await this._findByEnrollment(enrollmentId);

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificate for the given enrollment' });
    }
  }

  /**
   * Retrieves all certificates issued by a given staff member. Supports
   * the audit requirements described in context.md ('Generación de
   * certificado' must be traceable to the issuing user).
   *
   * @param {number} userId - The id of the issuing user.
   * @returns {Promise<Certificate[]>} - The matching certificate records.
   */
  async listByUser(userId) {

    if (!userId) {
      throw Boom.badRequest('No user identifier was provided');
    }

    try {
      const certificatesByUser = await Certificate.findAll({
        where: { userId },
        order: [['issueDate', 'DESC']]
      });

      return certificatesByUser;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificates for the given user' });
    }
  }

  /**
   * Retrieves all certificates issued under a given institution.
   *
   * @param {number} institutionId - The id of the institution.
   * @returns {Promise<Certificate[]>} - The matching certificate records.
   */
  async listByInstitution(institutionId) {

    if (!institutionId) {
      throw Boom.badRequest('No institution identifier was provided');
    }

    try {
      const certificatesByInstitution = await Certificate.findAll({
        where: { institutionId },
        order: [['issueDate', 'DESC']]
      });

      return certificatesByInstitution;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificates for the given institution' });
    }
  }

  /**
   * Retrieves all certificates with a given status (EMITIDO, ANULADO,
   * or REIMPRESO).
   *
   * @param {string} status - The status to filter by.
   * @returns {Promise<Certificate[]>} - The matching certificate records.
   */
  async listByStatus(status) {

    CertificateServices._assertValidStatus(status);

    try {
      const certificatesByStatus = await Certificate.findAll({
        where: { status },
        order: [['issueDate', 'DESC']]
      });

      return certificatesByStatus;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificates with the given status' });
    }
  }

  /**
   * Retrieves all certificates issued within a given date range.
   * Supports the dashboard/statistics requirements described in
   * context.md ('Indicadores generales', 'Gráficas').
   *
   * @param {string} startDate - The start of the range (inclusive), as a date string.
   * @param {string} endDate - The end of the range (inclusive), as a date string.
   * @returns {Promise<Certificate[]>} - The matching certificate records.
   */
  async listByDateRange(startDate, endDate) {

    if (!startDate || !endDate) {
      throw Boom.badRequest('Both a start date and an end date must be provided');
    }

    try {
      const certificatesInRange = await Certificate.findAll({
        where: {
          issueDate: { [Op.between]: [startDate, endDate] }
        },
        order: [['issueDate', 'DESC']]
      });

      return certificatesInRange;

    } catch (error) {
      throw Boom.boomify(error, { message: 'Unable to find the certificates within the given date range' });
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
   * Finds a certificate by its primary key.
   *
   * @private
   * @param {number} certificateId - The id of the certificate to find.
   * @returns {Promise<Certificate|null>} - The certificate record, or null if not found.
   */
  async _findById(certificateId) {
    return Certificate.findOne({ where: { id: certificateId } });
  }

  /**
   * Finds a certificate by its exact act number.
   *
   * @private
   * @param {string} actNumber - The act number to find.
   * @returns {Promise<Certificate|null>} - The certificate record, or null if not found.
   */
  async _findByActNumber(actNumber) {
    return Certificate.findOne({ where: { actNumber } });
  }

  /**
   * Finds the certificate associated with a given enrollment, if any.
   *
   * @private
   * @param {number} enrollmentId - The id of the enrollment to check.
   * @returns {Promise<Certificate|null>} - The certificate record, or null if none exists.
   */
  async _findByEnrollment(enrollmentId) {
    return Certificate.findOne({ where: { enrollmentId } });
  }

  /**
   * Generates the next consecutive act number for the current calendar
   * year, in the format 'CERT-{year}-{six-digit sequence}' (e.g.
   * 'CERT-2026-000042'). The sequence is derived from the count of
   * certificates already issued this year, which is sufficient given
   * this system's expected issuance volume; a dedicated sequence table
   * would be a safer choice under high concurrent write load.
   *
   * @private
   * @returns {Promise<string>} - The generated act number.
   */
  async _generateNextActNumber() {
    const currentYear = new Date().getFullYear();

    const certificatesIssuedThisYear = await Certificate.count({
      where: {
        actNumber: { [Op.like]: `CERT-${currentYear}-%` }
      }
    });

    const nextSequence = String(certificatesIssuedThisYear + 1).padStart(6, '0');

    return `CERT-${currentYear}-${nextSequence}`;
  }

  /**
   * Ensures a certificate has no associated signatures before allowing
   * its deletion, since 'firma_certificado' references 'certificado'
   * with onDelete: 'RESTRICT' at the database level.
   *
   * @private
   * @param {number} certificateId - The id of the certificate to check.
   * @throws {Boom} - A conflict error when dependent signatures exist.
   * @returns {Promise<void>}
   */
  async _assertNoAssociatedSignatures(certificateId) {
    const associatedSignature = await CertificateSignature.findOne({
      where: { certificateId }
    });

    if (associatedSignature) {
      throw Boom.conflict('The certificate cannot be deleted because it has associated signatures');
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
   * The closed set of certificate statuses allowed by the
   * 'estado_certificado' ENUM column, exposed as named constants so
   * callers never hardcode the raw Spanish strings.
   *
   * @static
   * @type {{ISSUED: string, VOIDED: string, REPRINTED: string}}
   */
  static STATUS = {
    ISSUED: 'EMITIDO',
    VOIDED: 'ANULADO',
    REPRINTED: 'REIMPRESO',
  };

  /**
   * Validates that a status belongs to the closed set of certificate
   * statuses, throwing a clear Boom error before the query ever reaches
   * the database.
   *
   * @private
   * @static
   * @param {string} status - The status to validate.
   * @throws {Boom} - A bad request error when the status is not allowed.
   * @returns {void}
   */
  static _assertValidStatus(status) {
    const validStatuses = Object.values(CertificateServices.STATUS);

    if (!validStatuses.includes(status)) {
      throw Boom.badRequest(`The certificate status must be one of: ${validStatuses.join(', ')}`);
    }
  }
}

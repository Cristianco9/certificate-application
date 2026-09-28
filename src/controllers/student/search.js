// Import the StudentServices class to manage student-related database operations
import { StudentServices } from '../../services/studentServices.js';
// Boom allows managing possible errors with HTTP-friendly error objects
import Boom from '@hapi/boom';

/**
 * Controller function to search students using flexible, multi-criteria
 * filters collected from the frontend's certificate-generation search
 * dialog.
 *
 * Extracts every optional filter from the request body — the Joi schema
 * `studentSchema.searchStudents` has already validated each field's
 * shape and enforced that `firstName` and `firstLastName` are present —
 * and delegates the query to StudentServices.searchStudents, which
 * composes the WHERE clauses and JOINs needed to filter on both the
 * `estudiante` columns and the related `matricula`/`grupo` columns
 * (year, grade, group name, jornada).
 *
 * The response echoes the classic collection shape used by every other
 * read endpoint (success / message / total / records + rotated token),
 * so callers can consume it identically to `/students/list-all`,
 * `/students/get-by-municipality`, etc. Each returned student also
 * carries a `lastEnrollment` object (year, grade, group, jornada) so the
 * frontend can render the "Año de grado" and "Grado / grupo" columns of
 * the results table without an extra request.
 *
 * The rotated JWT is not signed here: authAppVerifyToken already
 * generated it upstream, wrote it to the httpOnly 'authentication'
 * cookie, and exposed the same value via res.locals.newUserToken for
 * clients (e.g. the React SPA) that also need the raw token in the body.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The validated request body (see studentSchema.searchStudents).
 * @param {string} req.body.firstName - Required. Partial first name.
 * @param {string} [req.body.secondName] - Optional. Partial second name.
 * @param {string} req.body.firstLastName - Required. Partial first last name.
 * @param {string} [req.body.secondLastName] - Optional. Partial second last name.
 * @param {string} [req.body.documentNumber] - Optional. Exact document number.
 * @param {string} [req.body.documentTypeId] - Optional. Document type id filter.
 * @param {string} [req.body.lastAcademicYear] - Optional. 4-digit academic year (1900–2099).
 * @param {string} [req.body.gradeId] - Optional. Grade id filter.
 * @param {string} [req.body.group] - Optional. Partial group name.
 * @param {string} [req.body.birthplace] - Optional. Partial municipality name.
 * @param {string} [req.body.jornada] - Optional. 'DIURNA' or 'NOCTURNA'.
 * @param {Object} res - The Express response object.
 * @param {string} res.locals.newUserToken - The rotated JWT set by authAppVerifyToken.
 * @param {Function} next - The next middleware function in the Express.js stack.
 *
 * @returns {Promise<void>} - Sends a JSON response with the matching students
 * (each shaped as the standard formatted student plus a `lastEnrollment`
 * object: `{ year, shift, group: { id, name }, grade: { id, name } | null }`,
 * or `null` when the student has no enrollments), the count of records
 * returned by this request, and the rotated token.
 */
export const searchStudents = async (req, res, next) => {
  const studentManager = new StudentServices();

  try {
    const { total, records } = await studentManager.searchStudents({
      firstName: req.body.firstName,
      secondName: req.body.secondName,
      firstLastName: req.body.firstLastName,
      secondLastName: req.body.secondLastName,
      documentNumber: req.body.documentNumber,
      documentTypeId: req.body.documentTypeId,
      lastAcademicYear: req.body.lastAcademicYear,
      gradeId: req.body.gradeId,
      group: req.body.group,
      birthplace: req.body.birthplace,
      jornada: req.body.jornada,
    });

    return res.status(200).json({
      success: true,
      message: 'Búsqueda de estudiantes realizada exitosamente',
      total,
      students: records,
      authentication: res.locals.newUserToken,
    });
  } catch (error) {
    const boomError = Boom.boomify(error, {
      message: 'No es posible buscar los estudiantes con los filtros indicados',
    });
    next(boomError);
  }
};

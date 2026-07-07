// ============================================================
// CERTIFICATE-APPLICATION - SEQUELIZE ASSOCIATIONS
// ============================================================
// This file defines all relationships between models.
// Import and call setupAssociations() AFTER all models are
// loaded, before the database connection is synchronized.
// ============================================================

import { Country }               from './country.js';
import { Department }            from './department.js';
import { Municipality }          from './municipality.js';

import { DocumentType }          from './documentType.js';
import { Gender }                from './gender.js';
import { AcademicLevel }         from './academicLevel.js';
import { Role }                  from './role.js';

import { User }                  from './user.js';
import { Phone }                 from './phone.js';
import { PhoneEntity }           from './phoneEntity.js';

import { Student }               from './student.js';
import { Grade }                 from './grade.js';
import { Institution }           from './institution.js';
import { Subject }               from './subject.js';
import { Group }                 from './group.js';
import { Enrollment }            from './enrollment.js';
import { Score }                 from './score.js';

import { CertificateRecipient }  from './certificateRecipient.js';
import { Certificate }           from './certificate.js';
import { CertificateSignature }  from './certificateSignature.js';

export function setupAssociations() {

  // ============================================================
  // DEPARTMENT
  // FK: countryId (allowNull: false) -> Country
  // ============================================================

  // A country can have many departments
  Country.hasMany(Department, {
    foreignKey: 'countryId',
    sourceKey: 'id',
    as: 'departments',
  });

  // A department belongs to one country
  Department.belongsTo(Country, {
    foreignKey: 'countryId',
    targetKey: 'id',
    as: 'country',
  });

  // ============================================================
  // MUNICIPALITY
  // FK: departmentId (allowNull: false) -> Department
  // ============================================================

  // A department can have many municipalities
  Department.hasMany(Municipality, {
    foreignKey: 'departmentId',
    sourceKey: 'id',
    as: 'municipalities',
  });

  // A municipality belongs to one department
  Municipality.belongsTo(Department, {
    foreignKey: 'departmentId',
    targetKey: 'id',
    as: 'department',
  });

  // ============================================================
  // USER
  // FKs: documentTypeId, municipalityId, roleId, academicLevelId,
  //      genderId (all allowNull: false)
  // ============================================================

  // A document type can have many users
  DocumentType.hasMany(User, {
    foreignKey: 'documentTypeId',
    sourceKey: 'id',
    as: 'users',
  });

  // A user belongs to one document type
  User.belongsTo(DocumentType, {
    foreignKey: 'documentTypeId',
    targetKey: 'id',
    as: 'documentType',
  });

  // A municipality can have many users
  Municipality.hasMany(User, {
    foreignKey: 'municipalityId',
    sourceKey: 'id',
    as: 'users',
  });

  // A user belongs to one municipality
  User.belongsTo(Municipality, {
    foreignKey: 'municipalityId',
    targetKey: 'id',
    as: 'municipality',
  });

  // A role can have many users
  Role.hasMany(User, {
    foreignKey: 'roleId',
    sourceKey: 'id',
    as: 'users',
  });

  // A user belongs to one role
  User.belongsTo(Role, {
    foreignKey: 'roleId',
    targetKey: 'id',
    as: 'role',
  });

  // An academic level can have many users
  AcademicLevel.hasMany(User, {
    foreignKey: 'academicLevelId',
    sourceKey: 'id',
    as: 'users',
  });

  // A user belongs to one academic level
  User.belongsTo(AcademicLevel, {
    foreignKey: 'academicLevelId',
    targetKey: 'id',
    as: 'academicLevel',
  });

  // A gender can have many users
  Gender.hasMany(User, {
    foreignKey: 'genderId',
    sourceKey: 'id',
    as: 'users',
  });

  // A user belongs to one gender
  User.belongsTo(Gender, {
    foreignKey: 'genderId',
    targetKey: 'id',
    as: 'gender',
  });

  // ============================================================
  // STUDENT
  // FK: municipalityId (allowNull: false) -> Municipality
  // FK: documentTypeId (allowNull: true) -> DocumentType
  // FK: genderId (allowNull: true) -> Gender
  // ============================================================

  // A municipality can have many students
  Municipality.hasMany(Student, {
    foreignKey: 'municipalityId',
    sourceKey: 'id',
    as: 'students',
  });

  // A student belongs to one municipality
  Student.belongsTo(Municipality, {
    foreignKey: 'municipalityId',
    targetKey: 'id',
    as: 'municipality',
  });

  // A document type can have many students
  DocumentType.hasMany(Student, {
    foreignKey: 'documentTypeId',
    sourceKey: 'id',
    as: 'students',
  });

  // A student belongs to one document type (optional: historical students may lack one)
  Student.belongsTo(DocumentType, {
    foreignKey: 'documentTypeId',
    targetKey: 'id',
    as: 'documentType',
  });

  // A gender can have many students
  Gender.hasMany(Student, {
    foreignKey: 'genderId',
    sourceKey: 'id',
    as: 'students',
  });

  // A student belongs to one gender (optional)
  Student.belongsTo(Gender, {
    foreignKey: 'genderId',
    targetKey: 'id',
    as: 'gender',
  });

  // ============================================================
  // INSTITUTION
  // FK: municipalityId (allowNull: true) -> Municipality
  // ============================================================

  // A municipality can have many institutions
  Municipality.hasMany(Institution, {
    foreignKey: 'municipalityId',
    sourceKey: 'id',
    as: 'institutions',
  });

  // An institution belongs to one municipality (optional)
  Institution.belongsTo(Municipality, {
    foreignKey: 'municipalityId',
    targetKey: 'id',
    as: 'municipality',
  });

  // ============================================================
  // GROUP
  // FK: gradeId (allowNull: true) -> Grade
  // FK: institutionId (allowNull: true) -> Institution
  // ============================================================

  // A grade can have many groups
  Grade.hasMany(Group, {
    foreignKey: 'gradeId',
    sourceKey: 'id',
    as: 'groups',
  });

  // A group belongs to one grade (optional)
  Group.belongsTo(Grade, {
    foreignKey: 'gradeId',
    targetKey: 'id',
    as: 'grade',
  });

  // An institution can have many groups
  Institution.hasMany(Group, {
    foreignKey: 'institutionId',
    sourceKey: 'id',
    as: 'groups',
  });

  // A group belongs to one institution (optional)
  Group.belongsTo(Institution, {
    foreignKey: 'institutionId',
    targetKey: 'id',
    as: 'institution',
  });

  // ============================================================
  // ENROLLMENT
  // FK: studentId (allowNull: true) -> Student
  // FK: groupId (allowNull: true) -> Group
  // ============================================================

  // A student can have many enrollments
  Student.hasMany(Enrollment, {
    foreignKey: 'studentId',
    sourceKey: 'id',
    as: 'enrollments',
  });

  // An enrollment belongs to one student (optional)
  Enrollment.belongsTo(Student, {
    foreignKey: 'studentId',
    targetKey: 'id',
    as: 'student',
  });

  // A group can have many enrollments
  Group.hasMany(Enrollment, {
    foreignKey: 'groupId',
    sourceKey: 'id',
    as: 'enrollments',
  });

  // An enrollment belongs to one group (optional)
  Enrollment.belongsTo(Group, {
    foreignKey: 'groupId',
    targetKey: 'id',
    as: 'group',
  });

  // ============================================================
  // SCORE
  // FK: subjectId (allowNull: false) -> Subject
  // FK: enrollmentId (allowNull: false) -> Enrollment
  // ============================================================

  // A subject can have many scores
  Subject.hasMany(Score, {
    foreignKey: 'subjectId',
    sourceKey: 'id',
    as: 'scores',
  });

  // A score belongs to one subject
  Score.belongsTo(Subject, {
    foreignKey: 'subjectId',
    targetKey: 'id',
    as: 'subject',
  });

  // An enrollment can have many scores (one per subject)
  Enrollment.hasMany(Score, {
    foreignKey: 'enrollmentId',
    sourceKey: 'id',
    as: 'scores',
  });

  // A score belongs to one enrollment
  Score.belongsTo(Enrollment, {
    foreignKey: 'enrollmentId',
    targetKey: 'id',
    as: 'enrollment',
  });

  // ============================================================
  // CERTIFICATE RECIPIENT
  // FK: documentTypeId (allowNull: false) -> DocumentType
  // ============================================================

  // A document type can have many certificate recipients
  DocumentType.hasMany(CertificateRecipient, {
    foreignKey: 'documentTypeId',
    sourceKey: 'id',
    as: 'certificateRecipients',
  });

  // A certificate recipient belongs to one document type
  CertificateRecipient.belongsTo(DocumentType, {
    foreignKey: 'documentTypeId',
    targetKey: 'id',
    as: 'documentType',
  });

  // ============================================================
  // CERTIFICATE
  // FK: userId (allowNull: false) -> User
  // FK: institutionId (allowNull: false) -> Institution
  // FK: enrollmentId (allowNull: false, unique: true) -> Enrollment
  // FK: recipientId (allowNull: true) -> CertificateRecipient
  // ============================================================

  // A user can issue many certificates
  User.hasMany(Certificate, {
    foreignKey: 'userId',
    sourceKey: 'id',
    as: 'issuedCertificates',
  });

  // A certificate belongs to one issuing user
  Certificate.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'id',
    as: 'issuer',
  });

  // An institution can have many certificates
  Institution.hasMany(Certificate, {
    foreignKey: 'institutionId',
    sourceKey: 'id',
    as: 'certificates',
  });

  // A certificate belongs to one institution
  Certificate.belongsTo(Institution, {
    foreignKey: 'institutionId',
    targetKey: 'id',
    as: 'institution',
  });

  // An enrollment has one certificate (enrollmentId is unique: true in the
  // model, so a reprint reuses the same certificate record rather than
  // creating a new one)
  Enrollment.hasOne(Certificate, {
    foreignKey: 'enrollmentId',
    sourceKey: 'id',
    as: 'certificate',
  });

  // A certificate belongs to one enrollment
  Certificate.belongsTo(Enrollment, {
    foreignKey: 'enrollmentId',
    targetKey: 'id',
    as: 'enrollment',
  });

  // A certificate recipient can have many certificates
  CertificateRecipient.hasMany(Certificate, {
    foreignKey: 'recipientId',
    sourceKey: 'id',
    as: 'certificates',
  });

  // A certificate belongs to one recipient (optional)
  Certificate.belongsTo(CertificateRecipient, {
    foreignKey: 'recipientId',
    targetKey: 'id',
    as: 'recipient',
  });

  // ============================================================
  // CERTIFICATE SIGNATURE
  // FK: userId (allowNull: false, unique: true) -> User
  // FK: certificateId (allowNull: false) -> Certificate
  // FK: municipalityId (allowNull: false) -> Municipality
  // ============================================================

  // A user has one signature record (userId is unique: true in the model,
  // matching the business rule that only one signer record exists per user)
  User.hasOne(CertificateSignature, {
    foreignKey: 'userId',
    sourceKey: 'id',
    as: 'signature',
  });

  // A certificate signature belongs to one signer user
  CertificateSignature.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'id',
    as: 'signer',
  });

  // A certificate can have many signatures
  Certificate.hasMany(CertificateSignature, {
    foreignKey: 'certificateId',
    sourceKey: 'id',
    as: 'signatures',
  });

  // A certificate signature belongs to one certificate
  CertificateSignature.belongsTo(Certificate, {
    foreignKey: 'certificateId',
    targetKey: 'id',
    as: 'certificate',
  });

  // A municipality can have many certificate signatures
  Municipality.hasMany(CertificateSignature, {
    foreignKey: 'municipalityId',
    sourceKey: 'id',
    as: 'certificateSignatures',
  });

  // A certificate signature belongs to one municipality
  CertificateSignature.belongsTo(Municipality, {
    foreignKey: 'municipalityId',
    targetKey: 'id',
    as: 'municipality',
  });

  // ============================================================
  // PHONE ENTITY (polymorphic bridge)
  // FK: phoneId (allowNull: false) -> Phone
  // FK: userId (allowNull: true) -> User
  // FK: studentId (allowNull: true) -> Student
  // FK: certificateRecipientId (allowNull: true) -> CertificateRecipient
  // FK: institutionId (allowNull: true) -> Institution
  // ============================================================

  // A phone can be linked to many phone-entity rows
  Phone.hasMany(PhoneEntity, {
    foreignKey: 'phoneId',
    sourceKey: 'id',
    as: 'phoneEntities',
  });

  // A phone-entity link belongs to one phone
  PhoneEntity.belongsTo(Phone, {
    foreignKey: 'phoneId',
    targetKey: 'id',
    as: 'phone',
  });

  // A user can have many phone-entity links
  User.hasMany(PhoneEntity, {
    foreignKey: 'userId',
    sourceKey: 'id',
    as: 'phoneEntities',
  });

  // A phone-entity link belongs to one user (when the owner is a user)
  PhoneEntity.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'id',
    as: 'user',
  });

  // A student can have many phone-entity links
  Student.hasMany(PhoneEntity, {
    foreignKey: 'studentId',
    sourceKey: 'id',
    as: 'phoneEntities',
  });

  // A phone-entity link belongs to one student (when the owner is a student)
  PhoneEntity.belongsTo(Student, {
    foreignKey: 'studentId',
    targetKey: 'id',
    as: 'student',
  });

  // A certificate recipient can have many phone-entity links
  CertificateRecipient.hasMany(PhoneEntity, {
    foreignKey: 'certificateRecipientId',
    sourceKey: 'id',
    as: 'phoneEntities',
  });

  // A phone-entity link belongs to one certificate recipient (when the owner is a recipient)
  PhoneEntity.belongsTo(CertificateRecipient, {
    foreignKey: 'certificateRecipientId',
    targetKey: 'id',
    as: 'certificateRecipient',
  });

  // An institution can have many phone-entity links
  Institution.hasMany(PhoneEntity, {
    foreignKey: 'institutionId',
    sourceKey: 'id',
    as: 'phoneEntities',
  });

  // A phone-entity link belongs to one institution (when the owner is an institution)
  PhoneEntity.belongsTo(Institution, {
    foreignKey: 'institutionId',
    targetKey: 'id',
    as: 'institution',
  });

}

/**
 * 1. User Entity
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {'TEACHER' | 'STUDENT'} role
 * @property {string} email
 * @property {string} passwordHash
 */

/**
 * 2. Exam Entity
 * @typedef {Object} Exam
 * @property {string} id
 * @property {string} teacherId
 * @property {string} title
 * @property {string} description
 * @property {'DRAFT' | 'ACTIVE' | 'GRADING' | 'COMPLETED'} status
 * @property {number} passingGrade
 * @property {Array<Object>} questions
 * @property {Date} createdAt
 */

/**
 * 3. Question Entity
 * @typedef {Object} Question
 * @property {string} id
 * @property {'MULTIPLE_CHOICE' | 'OPEN_ENDED'} type
 * @property {string} text
 * @property {Array<string>} [options]
 * @property {string} correctAnswer
 * @property {number} points
 */

/**
 * 4. Submission Entity
 * @typedef {Object} Submission
 * @property {string} id
 * @property {string} examId
 * @property {string} studentId
 * @property {Object.<string, string>} answers
 * @property {number|null} finalGrade
 * @property {'SUBMITTED' | 'GRADED'} status
 * @property {Date} submittedAt
 */

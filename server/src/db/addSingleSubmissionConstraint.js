import { closePool, pool } from './connect.js';

async function addSingleSubmissionConstraint() {
  await pool.query(`
    ALTER TABLE submissions
    ADD CONSTRAINT one_submission_per_student_exam
    UNIQUE (exam_id, student_id)
  `);
  console.log('Added one_submission_per_student_exam constraint.');
}

addSingleSubmissionConstraint()
  .catch((error) => {
    if (error.code === '42710') {
      console.log('Constraint already exists.');
      return;
    }

    console.error('Failed to add one_submission_per_student_exam constraint.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(closePool);

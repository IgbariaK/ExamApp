import { closePool, pool } from './connect.js';

async function migrateExamAttempts() {
  await pool.query(`
    ALTER TABLE exams
    ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 1;

    ALTER TABLE exams
    DROP CONSTRAINT IF EXISTS exams_max_attempts_check;

    ALTER TABLE exams
    ADD CONSTRAINT exams_max_attempts_check CHECK (max_attempts >= 1);

    ALTER TABLE submissions
    DROP CONSTRAINT IF EXISTS one_submission_per_student_exam;
  `);
  console.log('Exam attempt limits are ready.');
}

migrateExamAttempts()
  .catch((error) => {
    console.error('Exam-attempt migration failed.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(closePool);

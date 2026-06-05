import { closePool, pool } from './connect.js';

async function getFirstExam() {
  console.log('Querying the database for the first exam...');

  const connectedAt = await pool.query('SELECT NOW() AS connected_at');
  console.log(`Database connected successfully at: ${connectedAt.rows[0].connected_at.toISOString()}`);

  const result = await pool.query(`
    SELECT
      e.id,
      e.title,
      e.time_limit,
      e.passing_grade,
      e.questions,
      u.name AS teacher_name
    FROM exams e
    JOIN users u ON u.id = e.teacher_id
    ORDER BY e.created_at
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    console.log('No exams found in the database. Please run npm run db:seed first.');
    return;
  }

  const exam = result.rows[0];
  console.log('Exam retrieved successfully:');
  console.log('----------------------------------------');
  console.log(`ID: ${exam.id}`);
  console.log(`Title: ${exam.title}`);
  console.log(`Teacher: ${exam.teacher_name}`);
  console.log(`Time Limit: ${exam.time_limit} minutes`);
  console.log(`Passing Grade: ${exam.passing_grade}`);
  console.log('');
  console.log('Nested Questions (JSONB parsed automatically by pg):');
  console.dir(exam.questions, { depth: null });
}

getFirstExam()
  .catch((error) => {
    console.error('Query failed.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(closePool);

import { closePool, pool } from './connect.js';

async function queryJsonb() {
  console.log('Flattening JSONB questions and answers from the exam database...');

  const questions = await pool.query(`
    SELECT
      e.title AS exam_title,
      question->>'id' AS question_id,
      question->>'type' AS question_type,
      question->>'text' AS question_text,
      (question->>'points')::INTEGER AS points
    FROM exams e,
      jsonb_array_elements(e.questions) AS question
    ORDER BY e.title, question->>'id'
  `);

  console.log('');
  console.log('Questions stored inside exams.questions JSONB:');
  console.table(questions.rows);

  const answers = await pool.query(`
    SELECT
      e.title AS exam_title,
      u.name AS student_name,
      answer.key AS question_id,
      answer.value #>> '{}' AS answer_text,
      s.status,
      s.final_grade
    FROM submissions s
    JOIN exams e ON e.id = s.exam_id
    JOIN users u ON u.id = s.student_id,
      jsonb_each(s.answers) AS answer
    ORDER BY e.title, u.name, answer.key
  `);

  console.log('');
  console.log('Answers stored inside submissions.answers JSONB:');
  console.table(answers.rows);
}

queryJsonb()
  .catch((error) => {
    console.error('JSONB query failed.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(closePool);

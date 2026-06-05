import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closePool, pool } from './connect.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const teacherId = '11111111-1111-4111-8111-111111111111';
const studentId = '22222222-2222-4222-8222-222222222222';
const secondStudentId = '33333333-3333-4333-8333-333333333333';
const jsExamId = '44444444-4444-4444-8444-444444444444';
const reactExamId = '55555555-5555-4555-8555-555555555555';

const users = [
  [teacherId, 'Dr. Smith', 'smith@test.com', '1234', 'TEACHER'],
  [studentId, 'John Doe', 'john@test.com', '1234', 'STUDENT'],
  [secondStudentId, 'Maya Cohen', 'maya@test.com', '1234', 'STUDENT'],
];

const exams = [
  [
    jsExamId,
    teacherId,
    'JavaScript Basics',
    'Core JavaScript concepts with hybrid JSONB questions.',
    'ACTIVE',
    60,
    60,
    [
      {
        id: 'q1',
        text: 'What is typeof null?',
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'object',
        points: 10,
        options: ['object', 'null', 'undefined'],
      },
      {
        id: 'q2',
        text: 'Explain closures in JavaScript.',
        type: 'OPEN_ENDED',
        correctAnswer: 'A closure is a function that remembers variables from its lexical scope.',
        points: 20,
      },
      {
        id: 'q3',
        text: 'Which array method creates a new transformed array?',
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'map',
        points: 10,
        options: ['forEach', 'map', 'push'],
      },
    ],
  ],
  [
    reactExamId,
    teacherId,
    'React Fundamentals',
    'Components, state, props, and rendering.',
    'DRAFT',
    45,
    70,
    [
      {
        id: 'q1',
        text: 'What hook manages local component state?',
        type: 'OPEN_ENDED',
        correctAnswer: 'useState',
        points: 15,
      },
      {
        id: 'q2',
        text: 'What are props used for?',
        type: 'OPEN_ENDED',
        correctAnswer: 'Passing data from a parent component to a child component.',
        points: 15,
      },
    ],
  ],
];

const submissions = [
  [
    '66666666-6666-4666-8666-666666666666',
    jsExamId,
    studentId,
    86,
    86,
    'GRADED',
    {
      q1: 'object',
      q2: 'A closure remembers the outer variables it was created with.',
      q3: 'map',
    },
  ],
  [
    '77777777-7777-4777-8777-777777777777',
    jsExamId,
    secondStudentId,
    null,
    null,
    'SUBMITTED',
    {
      q1: 'object',
      q2: 'A function with access to parent scope.',
      q3: 'forEach',
    },
  ],
];

async function recreateSchema() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schemaSql = await readFile(schemaPath, 'utf8');
  await pool.query(schemaSql);
}

async function seedPostgres() {
  console.log('Seeding Postgres database with hybrid JSONB data...');
  await recreateSchema();

  for (const user of users) {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      user
    );
  }

  for (const exam of exams) {
    await pool.query(
      `INSERT INTO exams
       (id, teacher_id, title, description, status, time_limit, passing_grade, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [...exam.slice(0, 7), JSON.stringify(exam[7])]
    );
  }

  for (const submission of submissions) {
    await pool.query(
      `INSERT INTO submissions
       (id, exam_id, student_id, score, final_grade, status, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [...submission.slice(0, 6), JSON.stringify(submission[6])]
    );
  }

  console.log('Seed completed.');
  console.log(`Inserted ${users.length} users, ${exams.length} exams, and ${submissions.length} submissions.`);
}

seedPostgres()
  .catch((error) => {
    console.error('Seed failed.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(closePool);

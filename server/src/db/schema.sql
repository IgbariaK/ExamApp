CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('TEACHER', 'STUDENT')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'GRADING', 'COMPLETED', 'ARCHIVED')),
  time_limit INTEGER NOT NULL DEFAULT 60,
  passing_grade INTEGER NOT NULL CHECK (passing_grade BETWEEN 0 AND 100),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT questions_are_array CHECK (jsonb_typeof(questions) = 'array')
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  final_grade INTEGER CHECK (final_grade BETWEEN 0 AND 100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('SUBMITTED', 'GRADED')),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT answers_are_object CHECK (jsonb_typeof(answers) = 'object')
);

CREATE INDEX exams_teacher_id_idx ON exams(teacher_id);
CREATE INDEX submissions_exam_id_idx ON submissions(exam_id);
CREATE INDEX submissions_student_id_idx ON submissions(student_id);
CREATE INDEX exams_questions_gin_idx ON exams USING GIN (questions);
CREATE INDEX submissions_answers_gin_idx ON submissions USING GIN (answers);

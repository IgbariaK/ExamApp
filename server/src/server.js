import express from 'express';
import { pool } from './db/connect.js';
import { createToken, hashPassword, verifyPassword, verifyToken } from './auth.js';
import { createInitialData } from './initialData.js';

export const app = express();
const port = Number(process.env.PORT) || 3001;
const serverDataSource = process.env.SERVER_DATA_SOURCE || 'auto';
const usePostgres = serverDataSource !== 'memory' && Boolean(process.env.DATABASE_URL);
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
let db = createInitialData();

app.use((request, response, next) => {
  const origin = request.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }

  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  next();
});

app.use(express.json());
app.use((request, response, next) => {
  const startedAt = Date.now();
  response.on('finish', () => {
    console.log(`${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const dbUserToClient = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
});

const dbExamToClient = (row) => ({
  id: row.id,
  teacherId: row.teacher_id,
  title: row.title,
  description: row.description,
  status: row.status,
  timeLimit: row.time_limit,
  passingGrade: row.passing_grade,
  questions: row.questions,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const dbSubmissionToClient = (row) => ({
  id: row.id,
  examId: row.exam_id,
  studentId: row.student_id,
  score: row.score,
  finalGrade: row.final_grade,
  status: row.status,
  answers: row.answers,
  submittedAt: row.submitted_at,
});

const findMemoryUserByEmail = (email) =>
  db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());

const authenticate = (request, response, next) => {
  const header = request.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return response.status(401).json({ message: 'Authentication required.' });
  }

  try {
    request.user = verifyToken(token);
    next();
  } catch (error) {
    response.status(401).json({ message: error.message || 'Invalid token.' });
  }
};

const requireRole = (...roles) => (request, response, next) => {
  if (!roles.includes(request.user.role)) {
    return response.status(403).json({ message: 'You are not allowed to perform this action.' });
  }
  next();
};

const canTeacherAccessExam = async (teacherId, examId) => {
  if (usePostgres) {
    const result = await pool.query('SELECT teacher_id FROM exams WHERE id = $1', [examId]);
    return result.rowCount > 0 && result.rows[0].teacher_id === teacherId;
  }

  const exam = db.exams.find((item) => String(item.id) === String(examId));
  return Boolean(exam && exam.teacherId === teacherId);
};

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', dataSource: usePostgres ? 'postgres' : 'memory' });
});

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const { email, passwordHash } = request.body;

    if (!email || !passwordHash) {
      return response.status(400).json({ message: 'Email and password are required.' });
    }

    if (usePostgres) {
      const result = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
      const user = result.rows[0];

      if (!user || !verifyPassword(passwordHash, user.password_hash)) {
        return response.json(null);
      }

      const clientUser = dbUserToClient(user);
      return response.json({ ...clientUser, token: createToken(clientUser) });
    }

    const user = findMemoryUserByEmail(email);
    if (!user || !verifyPassword(passwordHash, user.passwordHash)) {
      return response.json(null);
    }

    response.json({ ...publicUser(user), token: createToken(user) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reset', (_request, response) => {
  db = createInitialData();
  response.json(db);
});

app.post('/api/users', async (request, response, next) => {
  try {
    const { name, role, email, passwordHash } = request.body;
    const normalizedRole = String(role || '').toUpperCase();

    if (!name || !email || !passwordHash || !['TEACHER', 'STUDENT'].includes(normalizedRole)) {
      return response.status(400).json({ message: 'Name, email, password, and a valid role are required.' });
    }

    if (usePostgres) {
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, lower($2), $3, $4)
         RETURNING *`,
        [name, email, hashPassword(passwordHash), normalizedRole]
      );
      const user = dbUserToClient(result.rows[0]);
      return response.status(201).json({ ...user, token: createToken(user) });
    }

    const emailExists = db.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return response.status(409).json({ message: 'A user with this email already exists.' });
    }

    const user = {
      id: `u_${Date.now()}`,
      name,
      role: normalizedRole,
      email: email.toLowerCase(),
      passwordHash: hashPassword(passwordHash),
    };
    db.users.push(user);

    response.status(201).json({ ...publicUser(user), token: createToken(user) });
  } catch (error) {
    if (error.code === '23505') {
      response.status(409).json({ message: 'A user with this email already exists.' });
      return;
    }
    next(error);
  }
});

app.get('/api/exams', authenticate, async (request, response, next) => {
  try {
    const { teacherId, status } = request.query;

    if (usePostgres) {
      const conditions = [];
      const values = [];

      if (teacherId) {
        if (request.user.role !== 'TEACHER' || teacherId !== request.user.sub) {
          return response.status(403).json({ message: 'Teachers can only read their own exams.' });
        }
        values.push(teacherId);
        conditions.push(`teacher_id = $${values.length}`);
      }

      if (status) {
        if (request.user.role === 'STUDENT' && status !== 'ACTIVE') {
          return response.status(403).json({ message: 'Students can only read active exams.' });
        }
        values.push(status);
        conditions.push(`status = $${values.length}`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(`SELECT * FROM exams ${where} ORDER BY created_at DESC`, values);
      return response.json(result.rows.map(dbExamToClient));
    }

    let exams = db.exams;
    if (teacherId) {
      if (request.user.role !== 'TEACHER' || teacherId !== request.user.sub) {
        return response.status(403).json({ message: 'Teachers can only read their own exams.' });
      }
      exams = exams.filter((exam) => exam.teacherId === teacherId);
    }
    if (status) exams = exams.filter((exam) => exam.status === status);

    response.json(exams);
  } catch (error) {
    next(error);
  }
});

app.get('/api/exams/:id', authenticate, async (request, response, next) => {
  try {
    if (usePostgres) {
      const result = await pool.query('SELECT * FROM exams WHERE id = $1', [request.params.id]);
      const exam = result.rows[0];

      if (!exam) return response.status(404).json({ message: 'Record not found.' });
      if (request.user.role === 'TEACHER' && exam.teacher_id !== request.user.sub) {
        return response.status(403).json({ message: 'Teachers can only read their own exams.' });
      }
      if (request.user.role === 'STUDENT' && exam.status !== 'ACTIVE') {
        return response.status(403).json({ message: 'Students can only read active exams.' });
      }

      return response.json(dbExamToClient(exam));
    }

    const exam = db.exams.find((item) => String(item.id) === request.params.id);
    if (!exam) return response.status(404).json({ message: 'Record not found.' });
    response.json(exam);
  } catch (error) {
    next(error);
  }
});

app.post('/api/exams', authenticate, requireRole('TEACHER'), async (request, response, next) => {
  try {
    const exam = {
      ...request.body,
      teacherId: request.user.sub,
      title: request.body.title || 'Untitled Exam',
      status: request.body.status || 'DRAFT',
      passingGrade: Number(request.body.passingGrade ?? 60),
      questions: Array.isArray(request.body.questions) ? request.body.questions : [],
    };

    if (usePostgres) {
      const result = await pool.query(
        `INSERT INTO exams (teacher_id, title, description, status, time_limit, passing_grade, questions)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING *`,
        [
          exam.teacherId,
          exam.title,
          exam.description || '',
          exam.status,
          Number(exam.timeLimit ?? 60),
          exam.passingGrade,
          JSON.stringify(exam.questions),
        ]
      );
      return response.status(201).json(dbExamToClient(result.rows[0]));
    }

    const storedExam = { ...exam, id: exam.id || `exam_${Date.now()}` };
    db.exams.push(storedExam);
    response.status(201).json(storedExam);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/exams/:id', authenticate, requireRole('TEACHER'), async (request, response, next) => {
  try {
    if (!(await canTeacherAccessExam(request.user.sub, request.params.id))) {
      return response.status(404).json({ message: 'Record not found.' });
    }

    if (usePostgres) {
      const result = await pool.query(
        `UPDATE exams
         SET title = COALESCE($2, title),
             description = COALESCE($3, description),
             status = COALESCE($4, status),
             time_limit = COALESCE($5, time_limit),
             passing_grade = COALESCE($6, passing_grade),
             questions = COALESCE($7::jsonb, questions),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [
          request.params.id,
          request.body.title,
          request.body.description,
          request.body.status,
          request.body.timeLimit,
          request.body.passingGrade,
          request.body.questions === undefined ? null : JSON.stringify(request.body.questions),
        ]
      );
      return response.json(dbExamToClient(result.rows[0]));
    }

    const index = db.exams.findIndex((item) => String(item.id) === request.params.id);
    db.exams[index] = { ...db.exams[index], ...request.body, id: db.exams[index].id, teacherId: request.user.sub };
    response.json(db.exams[index]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/exams/:id', authenticate, requireRole('TEACHER'), async (request, response, next) => {
  try {
    if (!(await canTeacherAccessExam(request.user.sub, request.params.id))) {
      return response.status(404).json({ message: 'Record not found.' });
    }

    if (usePostgres) {
      await pool.query('DELETE FROM exams WHERE id = $1', [request.params.id]);
    } else {
      db.exams = db.exams.filter((item) => String(item.id) !== request.params.id);
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/submissions', authenticate, async (request, response, next) => {
  try {
    const { examId, studentId } = request.query;

    if (request.user.role === 'STUDENT' && studentId !== request.user.sub) {
      return response.status(403).json({ message: 'Students can only read their own submissions.' });
    }
    if (request.user.role === 'TEACHER' && examId && !(await canTeacherAccessExam(request.user.sub, examId))) {
      return response.status(403).json({ message: 'Teachers can only read submissions for their own exams.' });
    }

    if (usePostgres) {
      const conditions = [];
      const values = [];
      if (examId) {
        values.push(examId);
        conditions.push(`exam_id = $${values.length}`);
      }
      if (studentId) {
        values.push(studentId);
        conditions.push(`student_id = $${values.length}`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(`SELECT * FROM submissions ${where} ORDER BY submitted_at DESC`, values);
      return response.json(result.rows.map(dbSubmissionToClient));
    }

    let submissions = db.submissions;
    if (examId) submissions = submissions.filter((submission) => submission.examId === examId);
    if (studentId) submissions = submissions.filter((submission) => submission.studentId === studentId);
    response.json(submissions);
  } catch (error) {
    next(error);
  }
});

app.post('/api/submissions', authenticate, requireRole('STUDENT'), async (request, response, next) => {
  try {
    const submission = {
      examId: request.body.examId,
      studentId: request.user.sub,
      answers: request.body.answers || {},
      finalGrade: null,
      status: 'SUBMITTED',
    };

    if (usePostgres) {
      const existing = await pool.query(
        'SELECT id FROM submissions WHERE exam_id = $1 AND student_id = $2',
        [submission.examId, submission.studentId]
      );

      if (existing.rowCount > 0) {
        return response.status(409).json({ message: 'You have already submitted this exam.' });
      }

      const result = await pool.query(
        `INSERT INTO submissions (exam_id, student_id, answers, final_grade, status)
         VALUES ($1, $2, $3::jsonb, $4, $5)
         RETURNING *`,
        [submission.examId, submission.studentId, JSON.stringify(submission.answers), null, submission.status]
      );
      return response.status(201).json(dbSubmissionToClient(result.rows[0]));
    }

    const duplicateSubmission = db.submissions.some(
      (item) => item.examId === submission.examId && item.studentId === submission.studentId
    );

    if (duplicateSubmission) {
      return response.status(409).json({ message: 'You have already submitted this exam.' });
    }

    const storedSubmission = { ...submission, id: request.body.id || `sub_${Date.now()}` };
    db.submissions.push(storedSubmission);
    response.status(201).json(storedSubmission);
  } catch (error) {
    if (error.code === '23505') {
      response.status(409).json({ message: 'You have already submitted this exam.' });
      return;
    }
    next(error);
  }
});

app.patch('/api/submissions/:id', authenticate, requireRole('TEACHER'), async (request, response, next) => {
  try {
    if (usePostgres) {
      const existing = await pool.query('SELECT exam_id FROM submissions WHERE id = $1', [request.params.id]);
      if (!existing.rows[0] || !(await canTeacherAccessExam(request.user.sub, existing.rows[0].exam_id))) {
        return response.status(404).json({ message: 'Record not found.' });
      }

      const result = await pool.query(
        `UPDATE submissions
         SET final_grade = COALESCE($2, final_grade),
             score = COALESCE($3, score),
             status = COALESCE($4, status)
         WHERE id = $1
         RETURNING *`,
        [request.params.id, request.body.finalGrade, request.body.score, request.body.status]
      );
      return response.json(dbSubmissionToClient(result.rows[0]));
    }

    const index = db.submissions.findIndex((item) => String(item.id) === request.params.id);
    if (index === -1 || !(await canTeacherAccessExam(request.user.sub, db.submissions[index].examId))) {
      return response.status(404).json({ message: 'Record not found.' });
    }

    db.submissions[index] = { ...db.submissions[index], ...request.body, id: db.submissions[index].id };
    response.json(db.submissions[index]);
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);

  if (error.code === '42P01') {
    return response.status(503).json({
      message: 'Database tables are missing. Run npm run db:seed, then restart the server.',
    });
  }

  if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
    return response.status(503).json({
      message: 'Database connection failed. Check DATABASE_URL or run the server with SERVER_DATA_SOURCE=memory.',
    });
  }

  if (error.message?.includes('Tenant or user not found')) {
    return response.status(503).json({
      message: 'Database login failed. Check the database username, password, and database name in DATABASE_URL.',
    });
  }

  response.status(500).json({ message: error.message || 'Unexpected server error.' });
});

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`ExamApp server listening on http://localhost:${port}`);
  });
}

export default app;

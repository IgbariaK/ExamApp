# ExamApp

ExamApp is a full-stack exam management system for lecturers and students. Lecturers can create exams, manage questions, publish exams, review submissions, and publish grades. Students can log in, view available exams, submit answers, and review grades.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL with JSONB question and answer storage
- Authentication: signed JWT-style bearer tokens plus salted password hashing
- Local infrastructure: Docker Compose for PostgreSQL

## Architecture

```text
React Client
  |
  | HTTP /api with bearer token
  v
Express API
  |
  | SQL queries
  v
PostgreSQL
```

The client uses `MockDBService` as a data access layer. In client mode it stores data in browser local storage. In server mode it calls the Express API. The server can run against PostgreSQL for persistent storage or memory mode for quick demos.

## Features

- Teacher and student registration/login
- Role-based navigation
- Teacher exam dashboard
- Exam creation and editing
- Question management with question type metadata
- Exam publishing through status changes
- Student exam list
- Exam taking and answer submission
- Teacher submission review
- Manual grading and grade publishing
- Student grades page
- PostgreSQL schema with users, exams, and submissions
- JSONB storage for flexible questions and answers
- Backend route authorization for teacher/student workflows

## Data Modes

```powershell
npm run client
```

Runs the React app with browser-local data.

```powershell
npm run server
npm run client:server-data
```

Runs the Express API and starts the React app configured to call `/api`.

Server storage is controlled by `SERVER_DATA_SOURCE`:

- `SERVER_DATA_SOURCE=postgres` uses PostgreSQL when `DATABASE_URL` is configured.
- `SERVER_DATA_SOURCE=memory` forces in-memory demo data.
- If omitted, the server uses PostgreSQL when `DATABASE_URL` exists.

## Setup

Install dependencies:

```powershell
npm --prefix client install
npm --prefix server install
```

Create a `.env` file from `.env.example`, then choose a database mode.

For local Docker PostgreSQL:

```powershell
npm run db:up
$env:DATABASE_URL = "postgres://exam_app:exam_app_password@localhost:5432/exam_app"
$env:PGSSLMODE = "disable"
npm run db:seed
```

Run the app:

```powershell
npm run server
npm run client:server-data
```

## Test Accounts

After seeding PostgreSQL, use:

```text
Teacher: smith@test.com / 1234
Student: john@test.com / 1234
Student: maya@test.com / 1234
```

Memory mode includes:

```text
Teacher: smith@test.com / 1234
Student: john@test.com / 1234
```

## API Overview

Public routes:

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/users`

Authenticated exam routes:

- `GET /api/exams`
- `GET /api/exams/:id`
- `POST /api/exams`
- `PATCH /api/exams/:id`
- `DELETE /api/exams/:id`

Authenticated submission routes:

- `GET /api/submissions`
- `POST /api/submissions`
- `PATCH /api/submissions/:id`

Teacher-only actions include creating exams, updating exams, deleting exams, reading submissions for owned exams, and grading submissions. Student-only actions include submitting exams and reading personal submissions.

## Database

The PostgreSQL schema is in `server/src/db/schema.sql`.

Main entities:

- `users`: account identity, email, password hash, role
- `exams`: lecturer-owned exams, status, passing grade, JSONB questions
- `submissions`: student answers, grading status, final grade, JSONB answers

Useful commands:

```powershell
npm run db:up
npm run db:schema
npm run db:seed
npm run db:test-exam
npm run db:query-jsonb
npm run db:down
```

## Requirement Coverage

Implemented:

- Frontend React application
- Backend Express API
- PostgreSQL schema and seed flow
- Persistent storage when running in PostgreSQL mode
- Authentication tokens
- Teacher/student authorization on API routes
- Exam creation, publishing, taking, submission review, and grading
- Docker Compose for local PostgreSQL
- Documentation and architecture overview

Still recommended before final deployment:

- Deploy backend API and PostgreSQL to a cloud provider
- Configure production environment variables
- Add automated tests for backend authorization and exam workflows
- Add a proper CI workflow
- Add screenshots or a final demo video link

## Verification

Build the frontend:

```powershell
npm run build
```

Check server syntax:

```powershell
node --check server/src/server.js
```

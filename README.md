# ExamApp

ExamApp is a full-stack exam management system for lecturers and students. Lecturers can create exams, manage questions, publish exams, review submissions, and publish grades. Students can log in, view available exams, submit answers, and review grades.

Live app: https://exam-app-sage-one.vercel.app

GitHub repository: https://github.com/IgbariaK/ExamApp

## Team

- Khaled Igbaria - 211669700
- Tamer Khatib - 314742958

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL with JSONB question and answer storage
- Authentication: signed JWT-style bearer tokens plus salted password hashing
- Local infrastructure: Docker Compose for PostgreSQL
- Docker-based notification microservice

## Architecture

```mermaid
flowchart LR
  User[Teacher / Student] --> Client[React + Vite Client]
  Client -->|HTTP /api + Bearer token| API[Express API]
  API -->|SQL via pg| DB[(PostgreSQL)]
  API --> Auth[JWT-style token auth]
  Client --> Storage[Local Storage Session]
```

The client uses `MockDBService` as a data access layer. In client mode it stores data in browser local storage. In server mode it calls the Express API. The server can run against PostgreSQL for persistent storage or memory mode for quick demos.

## Database Diagram

```mermaid
erDiagram
  USERS ||--o{ EXAMS : creates
  USERS ||--o{ SUBMISSIONS : submits
  EXAMS ||--o{ SUBMISSIONS : receives

  USERS {
    uuid id PK
    varchar name
    varchar email UK
    varchar password_hash
    varchar role
    timestamp created_at
  }

  EXAMS {
    uuid id PK
    uuid teacher_id FK
    varchar title
    text description
    varchar status
    integer time_limit
    integer passing_grade
    integer max_attempts
    jsonb questions
    timestamp created_at
    timestamp updated_at
  }

  SUBMISSIONS {
    uuid id PK
    uuid exam_id FK
    uuid student_id FK
    integer score
    integer final_grade
    varchar status
    jsonb answers
    timestamp submitted_at
  }
```

Teachers choose how many attempts each student may make for an exam. The backend enforces the configured limit.

## Features

- Teacher and student registration/login
- Role-based navigation
- Teacher exam dashboard
- Exam creation and editing
- Open-ended and multiple-choice question creation
- Exam publishing through status changes
- Student exam list
- Exam taking and answer submission
- Configurable attempt limit per exam
- Teacher submission review
- Manual grading and grade publishing
- Student grades page
- PostgreSQL schema with users, exams, and submissions
- JSONB storage for flexible questions and answers
- Backend route authorization for teacher/student workflows
- Docker-based notification microservice for exam submission and grading events

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
- `SERVER_DATA_SOURCE=json` uses a local JSON file for persistent local development.
- `SERVER_DATA_SOURCE=memory` forces in-memory demo data.
- If omitted, the server uses PostgreSQL when `DATABASE_URL` exists.

Local JSON data is stored at `server/data/exam-app-db.json` by default. The path can be changed with `JSON_DB_PATH`.

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
$env:SERVER_DATA_SOURCE = "postgres"
npm run db:seed
```

For local JSON storage without PostgreSQL:

```powershell
npm run server:json
npm run client:server-data
```

For the Docker-based notification microservice:

```powershell
npm run microservice:up
$env:NOTIFICATION_SERVICE_URL = "http://localhost:4001"
npm run server:postgres
```

The notification service exposes:

- `GET http://localhost:4001/health`
- `POST http://localhost:4001/notifications`
- `GET http://localhost:4001/notifications`

The backend sends notification events when a student submits an exam and when a teacher grades a submission.

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

## API Examples

Login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "smith@test.com",
  "passwordHash": "1234"
}
```

Create an exam as a teacher:

```http
POST /api/exams
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "JavaScript Basics",
  "status": "DRAFT",
  "passingGrade": 60,
  "questions": [
    {
      "id": "q1",
      "type": "OPEN_ENDED",
      "text": "Explain closures.",
      "correctAnswer": "A function that remembers its lexical scope.",
      "points": 10
    }
  ]
}
```

Submit an exam as a student:

```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "examId": "exam-id",
  "answers": {
    "q1": "A closure remembers variables from the outer scope."
  }
}
```

When a student reaches the exam's attempt limit, the API returns `409 Conflict`.

## Database

The PostgreSQL schema is in `server/src/db/schema.sql`.

Main entities:

- `users`: account identity, email, password hash, role
- `exams`: lecturer-owned exams, status, passing grade, JSONB questions
- `submissions`: student answers, grading status, final grade, JSONB answers

Useful commands:

```powershell
npm run db:up
npm run microservice:up
npm run microservice:logs
npm run microservice:down
npm run server:postgres
npm run server:json
npm run db:schema
npm run db:seed
npm run db:migrate-attempts
npm run db:test-exam
npm run db:query-jsonb
npm run db:down
```

## Security

- Passwords are stored as salted PBKDF2 hashes.
- Login returns a signed bearer token used by protected API routes.
- Teacher routes verify that a teacher only accesses their own exams and submissions.
- Student routes verify that a student only accesses active exams and their own submissions.
- `.env` is ignored by Git so database credentials and secrets are not pushed to GitHub.
- Production deployment uses Vercel environment variables for `DATABASE_URL`, `JWT_SECRET`, and related settings.

## Demo Flow

1. Open the live app.
2. Log in as `smith@test.com / 1234`.
3. Create a new exam from the teacher dashboard.
4. Add questions and set the exam status to `ACTIVE`.
5. Log out and log in as `john@test.com / 1234`.
6. Open the active exam and submit answers.
7. Confirm the exam now shows as `Submitted` and cannot be taken again.
8. Log back in as the teacher.
9. Open results, review the submission, and assign a final grade.
10. Log in as the student and view the grade.

## Deployment

The recommended deployment setup is:

```text
Vercel static hosting -> React client
Vercel serverless function -> Express API
PostgreSQL database
Docker Compose -> Local PostgreSQL and notification microservice
```

### 1. PostgreSQL Database

Configure your PostgreSQL connection in `.env`:

```env
DATABASE_URL=postgres://exam_app:exam_app_password@localhost:5432/exam_app
PGSSLMODE=disable
SERVER_DATA_SOURCE=postgres
```

Seed the database:

```powershell
npm run db:seed
```

### 2. Vercel App

This repo includes `vercel.json` and `api/index.js` for deploying the React client and Express API together on Vercel.

In Vercel, import this GitHub repository and set these environment variables:

```text
DATABASE_URL=your PostgreSQL connection string
PGSSLMODE=require
SERVER_DATA_SOURCE=postgres
JWT_SECRET=a long random secret
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

The Vercel project should use:

```text
Framework preset: Other
Build command: npm --prefix client install && npm --prefix client run build -- --mode server
Output directory: client/dist
```

After deployment, verify the API:

```text
https://exam-app-sage-one.vercel.app/api/health
```

Expected response:

```json
{ "status": "ok", "dataSource": "postgres" }
```

For local development, keep using two terminals:

```powershell
npm run server
npm run client:server-data
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
- Docker Compose notification microservice
- Documentation and architecture overview
- Vercel deployment configuration
- PostgreSQL configuration
- Full-stack deployment path with hosted frontend, API, and database
- Architecture and database diagrams
- API examples, security notes, and demo flow

Still recommended before final deployment:

- Add automated tests for backend authorization and exam workflows
- Add a proper CI workflow
- Add screenshots or a final demo video link if required by the course

## Verification

Build the frontend:

```powershell
npm run build
```

Check server syntax:

```powershell
node --check server/src/server.js
```

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

## Deployment

The recommended deployment setup is:

```text
GitHub Pages or another static host -> React client
Render web service -> Express API
Neon -> PostgreSQL database
```

### 1. Neon Database

Create a Neon project and copy the pooled connection string. Put it in your local `.env` as:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require
PGSSLMODE=require
SERVER_DATA_SOURCE=postgres
```

Seed the database:

```powershell
npm run db:seed
```

### 2. Render Backend

This repo includes `render.yaml` for the Express API. In Render, create a new Blueprint/Web Service from the GitHub repository.

Set these environment variables in Render:

```text
DATABASE_URL=your Neon pooled connection string
PGSSLMODE=require
SERVER_DATA_SOURCE=postgres
JWT_SECRET=a long random secret
CLIENT_ORIGIN=https://your-frontend-url
```

Render should use:

```text
Root directory: server
Build command: npm install
Start command: npm start
Health check path: /api/health
```

### 3. Frontend

When the backend is deployed, build the client with:

```env
VITE_DATA_SOURCE=server
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

For local development, keep using:

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
- Documentation and architecture overview
- Render deployment blueprint
- Neon-compatible hosted PostgreSQL configuration

Still recommended before final deployment:

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

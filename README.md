# ExamApp

## Data modes

The React components always use `MockDBService`. Its implementation is selected by
the Vite mode:

- `npm run client` starts the client with browser-local data.
- `npm run server` starts the Express in-memory CRUD API on port `3001`.
- `npm run client:server-data` starts the client configured to call the server.

Run `npm install` in both `client` and `server` before the first launch.

VS Code tasks and debug configurations are included for client only, server only,
and client plus server. The client and server tasks use dedicated terminals so
their logs remain separate.

## Local Postgres with Docker

Install Docker Desktop with WSL 2 integration enabled, then run these commands
from the project root:

```powershell
npm --prefix client install
npm --prefix server install
npm run db:up
```

If you do not already have a `.env`, copy `.env.example` to `.env`. If you do
already have one, set these values in your terminal before running the database
scripts:

```powershell
$env:DATABASE_URL = "postgres://exam_app:exam_app_password@localhost:5432/exam_app"
$env:PGSSLMODE = "disable"
npm run db:seed
npm run db:test-exam
```

The Docker database uses:

```text
postgres://exam_app:exam_app_password@localhost:5432/exam_app
```

Keep `PGSSLMODE=disable` for the local Docker database. Use `PGSSLMODE=require`
only when connecting to a hosted Postgres service.

Useful commands:

```powershell
npm run db:logs
npm run db:down
```

## API

The server exposes CRUD routes for `users`, `exams`, and `submissions`:

- `GET /api/:collection`
- `GET /api/:collection/:id`
- `POST /api/:collection`
- `PATCH /api/:collection/:id`
- `DELETE /api/:collection/:id`

It also exposes `POST /api/auth/login`, `GET /api/health`, and `POST /api/reset`.

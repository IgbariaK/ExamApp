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

## API

The server exposes CRUD routes for `users`, `exams`, and `submissions`:

- `GET /api/:collection`
- `GET /api/:collection/:id`
- `POST /api/:collection`
- `PATCH /api/:collection/:id`
- `DELETE /api/:collection/:id`

It also exposes `POST /api/auth/login`, `GET /api/health`, and `POST /api/reset`.

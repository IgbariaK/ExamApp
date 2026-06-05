# Postgres JSONB Seed

This project keeps the frontend-friendly nested data model while storing it in
Postgres tables:

- `users` is a normal relational table.
- `exams` is relational, but stores its nested question array in `questions JSONB`.
- `submissions` is relational, but stores the student's question-id-to-answer map
  in `answers JSONB`.

The relationship is:

```text
users 1..many exams
users 1..many submissions
exams 1..many submissions
```

## Run

Set a Postgres connection string first:

```powershell
$env:DATABASE_URL = "postgres://USER:PASSWORD@HOST:5432/DATABASE"
```

For local Postgres without SSL:

```powershell
$env:PGSSLMODE = "disable"
```

Then run:

```powershell
npm --prefix server install
npm --prefix server run db:seed
npm --prefix server run db:test-exam
npm --prefix server run db:query-jsonb
```

`server/src/db/schema.sql` contains the table definitions, and
`server/src/db/jsonbQueries.sql` contains standalone SQL examples for querying
the nested JSONB values.

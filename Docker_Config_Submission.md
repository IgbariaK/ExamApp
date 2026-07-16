# Docker Config - ExamApp

## Project

ExamApp - Full Stack Exam Management System

## Team

- Khaled Igbaria - 211669700
- Tamer Khatib - 314742958

## Docker Purpose

The project includes Docker configuration for running a local PostgreSQL database during development and testing.

The project uses PostgreSQL locally through Docker.

The project also includes a custom Docker-based microservice:

```text
notification-service
```

This microservice receives notification events from the backend when:

- A student submits an exam
- A teacher grades a submission

## Docker File

The Docker Compose configuration is located in:

```text
docker-compose.yml
```

The custom microservice Dockerfile is located in:

```text
services/notification-service/Dockerfile
```

## docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: exam-app-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: exam_app
      POSTGRES_USER: exam_app
      POSTGRES_PASSWORD: exam_app_password
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U exam_app -d exam_app"]
      interval: 5s
      timeout: 5s
      retries: 10

  notification-service:
    build:
      context: ./services/notification-service
    container_name: exam-app-notification-service
    restart: unless-stopped
    environment:
      PORT: 4001
    ports:
      - "4001:4001"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:4001/health >/dev/null 2>&1 || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  postgres-data:
```

## Local PostgreSQL Connection

When using Docker locally, the backend connects to PostgreSQL with:

```env
SERVER_DATA_SOURCE=postgres
DATABASE_URL=postgres://exam_app:exam_app_password@localhost:5432/exam_app
PGSSLMODE=disable
```

## Run Locally With Docker PostgreSQL

Start PostgreSQL:

```powershell
npm run db:up
```

Seed the database:

```powershell
npm run db:seed
```

Run the backend with PostgreSQL:

```powershell
npm run server:postgres
```

Run the frontend:

```powershell
npm run client:server-data
```

## Run The Docker-Based Microservice

Start the notification microservice:

```powershell
npm run microservice:up
```

View microservice logs:

```powershell
npm run microservice:logs
```

Stop the microservice:

```powershell
npm run microservice:down
```

Health check:

```text
http://localhost:4001/health
```

List received notification events:

```text
http://localhost:4001/notifications
```

Backend environment variable for connecting to the microservice:

```env
NOTIFICATION_SERVICE_URL=http://localhost:4001
```

Stop PostgreSQL:

```powershell
npm run db:down
```

## Alternative Local JSON Mode

The project also supports a local JSON database mode without PostgreSQL:

```env
SERVER_DATA_SOURCE=json
```

Run JSON mode:

```powershell
npm run server:json
npm run client:server-data
```

Local JSON data is saved under:

```text
server/data/exam-app-db.json
```

This file is ignored by Git and is only for local development.

## Summary

This project supports:

- Database: PostgreSQL
- Local database: PostgreSQL through Docker Compose
- Local JSON storage mode
- Custom Docker-based notification microservice

The Docker setup satisfies the local PostgreSQL database requirement for the project.

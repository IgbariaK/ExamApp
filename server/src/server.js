import express from 'express';
import { createInitialData } from './initialData.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const collections = new Set(['users', 'exams', 'submissions']);
let db = createInitialData();

app.use(express.json());
app.use((request, response, next) => {
  const startedAt = Date.now();
  response.on('finish', () => {
    console.log(`${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

const getCollection = (request, response) => {
  const { collection } = request.params;
  if (!collections.has(collection)) {
    response.status(404).json({ message: `Unknown collection: ${collection}` });
    return null;
  }
  return db[collection];
};

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', dataSource: 'memory' });
});

app.post('/api/auth/login', (request, response) => {
  const { email, passwordHash } = request.body;
  const user = db.users.find(item => item.email === email && item.passwordHash === passwordHash);
  response.json(user || null);
});

app.post('/api/reset', (_request, response) => {
  db = createInitialData();
  response.json(db);
});

app.get('/api/:collection', (request, response) => {
  const collection = getCollection(request, response);
  if (!collection) return;

  const entries = collection.filter(item =>
    Object.entries(request.query).every(([key, value]) => String(item[key]) === value)
  );
  response.json(entries);
});

app.get('/api/:collection/:id', (request, response) => {
  const collection = getCollection(request, response);
  if (!collection) return;

  const entry = collection.find(item => String(item.id) === request.params.id);
  if (!entry) {
    return response.status(404).json({ message: 'Record not found.' });
  }
  response.json(entry);
});

app.post('/api/:collection', (request, response) => {
  const collection = getCollection(request, response);
  if (!collection) return;

  const entry = {
    ...request.body,
    id: request.body.id || `${request.params.collection.slice(0, -1)}_${Date.now()}`,
  };

  if (request.params.collection === 'users') {
    const emailExists = collection.some(item => item.email.toLowerCase() === entry.email.toLowerCase());
    if (emailExists) {
      return response.status(409).json({ message: 'A user with this email already exists.' });
    }
  }

  collection.push(entry);
  response.status(201).json(entry);
});

app.patch('/api/:collection/:id', (request, response) => {
  const collection = getCollection(request, response);
  if (!collection) return;

  const index = collection.findIndex(item => String(item.id) === request.params.id);
  if (index === -1) {
    return response.status(404).json({ message: 'Record not found.' });
  }

  collection[index] = { ...collection[index], ...request.body, id: collection[index].id };
  response.json(collection[index]);
});

app.delete('/api/:collection/:id', (request, response) => {
  const collection = getCollection(request, response);
  if (!collection) return;

  const index = collection.findIndex(item => String(item.id) === request.params.id);
  if (index === -1) {
    return response.status(404).json({ message: 'Record not found.' });
  }

  collection.splice(index, 1);
  response.status(204).end();
});

app.listen(port, () => {
  console.log(`ExamApp server listening on http://localhost:${port}`);
});

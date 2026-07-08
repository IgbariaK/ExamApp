import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createInitialData } from './initialData.js';

const defaultJsonPath = resolve(process.cwd(), 'data/exam-app-db.json');
const jsonPath = resolve(process.env.JSON_DB_PATH || defaultJsonPath);

const ensureJsonStore = () => {
  if (!existsSync(jsonPath)) {
    mkdirSync(dirname(jsonPath), { recursive: true });
    writeFileSync(jsonPath, JSON.stringify(createInitialData(), null, 2));
  }
};

export const loadJsonDb = () => {
  ensureJsonStore();
  return JSON.parse(readFileSync(jsonPath, 'utf8'));
};

export const saveJsonDb = (data) => {
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(data, null, 2));
};

export const resetJsonDb = () => {
  const data = createInitialData();
  saveJsonDb(data);
  return data;
};

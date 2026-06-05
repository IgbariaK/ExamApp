import pg from 'pg';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const loadEnvFile = (path) => {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(resolve(__dirname, '../../../.env'));
loadEnvFile(join(__dirname, '../../.env'));

const ssl =
  process.env.PGSSLMODE === 'disable' || !process.env.DATABASE_URL
    ? false
    : { rejectUnauthorized: false };

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export const closePool = () => pool.end();

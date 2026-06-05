import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closePool, pool } from './connect.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runSchema() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schemaSql = await readFile(schemaPath, 'utf8');

  console.log('Creating Postgres schema...');
  await pool.query(schemaSql);
  console.log('Schema created successfully.');
}

runSchema()
  .catch((error) => {
    console.error('Failed to create schema.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(closePool);

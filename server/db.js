/**
 * SQLite connection bootstrap.
 *
 * We use better-sqlite3 because it is synchronous, which keeps route handlers
 * simple (no async juggling) and is more than enough for a single-file local
 * database. The schema is applied on startup so a fresh clone works with no
 * manual migration step.
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The database file lives at the project root and is git-ignored.
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data.db');

const db = new Database(DB_PATH);

// WAL improves read/write concurrency; foreign keys must be enabled per-connection.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Applies the SQL schema. Safe to call repeatedly thanks to IF NOT EXISTS.
 */
export const initSchema = () => {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schema);
};

export default db;

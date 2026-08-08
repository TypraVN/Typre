import type { Snippet } from '../types'

export const sqlSnippets: Snippet[] = [
  {
    id: 'sql-select-where',
    language: 'sql',
    title: 'Select + where',
    code: `SELECT id, name, email\nFROM users\nWHERE is_active = true;`,
  },
  {
    id: 'sql-join',
    language: 'sql',
    title: 'Inner join',
    code: `SELECT o.id, u.name\nFROM orders o\nJOIN users u ON u.id = o.user_id;`,
  },
  {
    id: 'sql-group-by',
    language: 'sql',
    title: 'Group by + having',
    code: `SELECT user_id, COUNT(*) AS total\nFROM orders\nGROUP BY user_id\nHAVING COUNT(*) > 5;`,
  },
  {
    id: 'sql-insert',
    language: 'sql',
    title: 'Insert',
    code: `INSERT INTO users (name, email)\nVALUES ('Alice', 'alice@example.com');`,
  },
  {
    id: 'sql-update',
    language: 'sql',
    title: 'Update',
    code: `UPDATE products\nSET price = price * 1.1\nWHERE category = 'books';`,
  },
  {
    id: 'sql-create-table',
    language: 'sql',
    title: 'Create table',
    code: `CREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  title VARCHAR(200) NOT NULL\n);`,
  },
  {
    id: 'sql-subquery',
    language: 'sql',
    title: 'Subquery',
    code: `SELECT * FROM users\nWHERE id IN (SELECT user_id FROM orders);`,
  },
  {
    id: 'sql-left-join-null',
    language: 'sql',
    title: 'Left join + is null',
    code: `SELECT u.name\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.id IS NULL;`,
  },
  {
    id: 'sql-case-when',
    language: 'sql',
    title: 'Case when',
    code: `SELECT name,\n  CASE WHEN age >= 18 THEN 'adult' ELSE 'minor' END AS kind\nFROM users;`,
  },
  {
    id: 'sql-upsert',
    language: 'sql',
    title: 'Upsert',
    code: `INSERT INTO settings (key, value)\nVALUES ('theme', 'dark')\nON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
  },
  {
    id: 'sql-window',
    language: 'sql',
    title: 'Window function',
    code: `SELECT name, wpm,\n  RANK() OVER (ORDER BY wpm DESC) AS rank\nFROM scores;`,
  },
  {
    id: 'sql-delete-where',
    language: 'sql',
    title: 'Delete + interval',
    code: `DELETE FROM sessions\nWHERE created_at < NOW() - INTERVAL '30 days';`,
  },
]

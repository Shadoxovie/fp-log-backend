import Database from 'better-sqlite3';
import fs from 'fs';

export function initDb(path) {
  const dir = path.replace(/\/[^\/]+$/, '');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  const db = new Database(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      fp TEXT,
      account INTEGER,
      char INTEGER,
      nick TEXT,
      meta TEXT,
      status TEXT,
      ts TEXT
    );
  `);
  const insert = db.prepare('INSERT INTO logs (type, fp, account, char, nick, meta, status, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const all = db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT ? OFFSET ?');
  const count = db.prepare('SELECT COUNT(*) as c FROM logs');
  return { db, insert, all, count };
}
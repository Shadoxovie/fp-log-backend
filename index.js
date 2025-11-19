import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || './data/fplog.sqlite';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme';

const { insert, all, count } = initDb(DB_PATH);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use(morgan('combined'));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/check', (req, res) => {
  const body = req.body || {};
  insert.run('check', body.fp || null, body.account || null, body.char || null, null, JSON.stringify(body), 'received', new Date().toISOString());
  res.json({ fpIsLegal: true, newlyRegistered: false, knownNick: true });
});

app.post('/log', (req, res) => {
  const body = req.body || {};
  insert.run('log', body.fp || null, body.account || null, body.char || null, null, JSON.stringify(body), 'received', new Date().toISOString());
  res.json({ ok: true });
});

app.post('/nick', (req, res) => {
  const body = req.body || {};
  insert.run('nick', null, body.account || null, null, body.nick || null, JSON.stringify(body), 'received', new Date().toISOString());
  res.json({ ok: true });
});

app.get('/api/logs', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  const limit = Math.min(1000, Number(req.query.limit || 200));
  const offset = Number(req.query.offset || 0);
  const rows = all.all(limit, offset);
  const total = count.get().c;
  res.json({ total, rows });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`FP log API running on port ${PORT}`));
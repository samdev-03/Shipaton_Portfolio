import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  scrypt as scryptCb,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCb);
export const hash = (s) => createHash('sha256').update(s).digest('hex');
export const token = () => randomBytes(32).toString('base64url');
export const secureEqual = (a, b) =>
  typeof a === 'string' &&
  typeof b === 'string' &&
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
export async function passwordHash(p) {
  const salt = randomBytes(16).toString('hex');
  return (
    salt +
    ':' +
    (await scrypt(p, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })).toString('hex')
  );
}
export async function passwordValid(p, encoded) {
  const [salt, h] = encoded.split(':');
  return secureEqual(
    (await scrypt(p, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })).toString('hex'),
    h,
  );
}
export function createStore(path, key) {
  if (!/^[a-f0-9]{64}$/i.test(key || '')) throw Error('DATA_KEY must be a 32-byte hex key.');
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  if (path !== ':memory:') chmodSync(path, 0o600);
  db.exec('PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;PRAGMA busy_timeout=5000;');
  db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,app TEXT NOT NULL,email_hash TEXT NOT NULL,profile TEXT NOT NULL,password TEXT NOT NULL,recovery TEXT NOT NULL,analytics INTEGER DEFAULT 0,notifications INTEGER DEFAULT 0,ai INTEGER DEFAULT 0,created_at INTEGER NOT NULL,UNIQUE(app,email_hash));
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL,payload TEXT NOT NULL,version INTEGER DEFAULT 1,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS records_owner ON records(user_id,kind,created_at);
 CREATE TABLE IF NOT EXISTS circles(id TEXT PRIMARY KEY,owner TEXT REFERENCES users(id) ON DELETE CASCADE,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS members(circle_id TEXT REFERENCES circles(id) ON DELETE CASCADE,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(circle_id,user_id));
 CREATE TABLE IF NOT EXISTS invites(hash TEXT PRIMARY KEY,circle_id TEXT REFERENCES circles(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,circle_id TEXT REFERENCES circles(id) ON DELETE CASCADE,payload TEXT NOT NULL,status TEXT DEFAULT 'open',assignee TEXT,version INTEGER DEFAULT 1,updated_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,payload TEXT NOT NULL,share_hash TEXT UNIQUE,status TEXT DEFAULT 'draft',accepted TEXT,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS entitlements(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,active INTEGER NOT NULL,expires_at INTEGER,checked_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS webhooks(id TEXT PRIMARY KEY,received_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS reminders(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,due_at INTEGER NOT NULL,state TEXT DEFAULT 'pending',attempts INTEGER DEFAULT 0,next_attempt INTEGER NOT NULL,provider_id TEXT);
 CREATE TABLE IF NOT EXISTS deletion_jobs(id TEXT PRIMARY KEY,app TEXT NOT NULL,user_id TEXT NOT NULL,provider TEXT NOT NULL,state TEXT DEFAULT 'pending',attempts INTEGER DEFAULT 0,next_attempt INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,app TEXT NOT NULL,name TEXT NOT NULL,variant TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);`);
  const secret = Buffer.from(key, 'hex');
  return {
    db,
    run: (sql, ...args) => db.prepare(sql).run(...args),
    get: (sql, ...args) => db.prepare(sql).get(...args),
    all: (sql, ...args) => db.prepare(sql).all(...args),
    seal(value) {
      const iv = randomBytes(12),
        c = createCipheriv('aes-256-gcm', secret, iv);
      const bytes = Buffer.concat([c.update(JSON.stringify(value)), c.final()]);
      return Buffer.concat([iv, c.getAuthTag(), bytes]).toString('base64');
    },
    open(value) {
      const bytes = Buffer.from(value, 'base64'),
        d = createDecipheriv('aes-256-gcm', secret, bytes.subarray(0, 12));
      d.setAuthTag(bytes.subarray(12, 28));
      return JSON.parse(Buffer.concat([d.update(bytes.subarray(28)), d.final()]).toString());
    },
    transaction(fn) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const r = fn();
        db.exec('COMMIT');
        return r;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    close: () => db.close(),
  };
}

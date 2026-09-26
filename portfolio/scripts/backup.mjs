import { DatabaseSync, backup } from 'node:sqlite';
import { chmod } from 'node:fs/promises';
const destination = process.argv[2];
if (!destination) throw Error('Pass a backup destination in a protected directory.');
const db = new DatabaseSync(process.env.DB_PATH || './data/portfolio.sqlite', { readOnly: true });
try {
  await backup(db, destination);
  await chmod(destination, 0o600);
  console.log('Consistent backup created. Protect it and keep DATA_KEY separately.');
} finally {
  db.close();
}

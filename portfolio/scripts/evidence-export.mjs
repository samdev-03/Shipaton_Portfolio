import { mkdir, writeFile } from 'node:fs/promises';
if (!process.env.PUBLIC_ORIGIN?.startsWith('https://') || !process.env.OPS_TOKEN)
  throw Error('Set the live HTTPS origin and OPS_TOKEN in the private environment.');
const r = await fetch(process.env.PUBLIC_ORIGIN + '/ops/evidence', {
  headers: { Authorization: 'Bearer ' + process.env.OPS_TOKEN },
  signal: AbortSignal.timeout(15000),
});
if (!r.ok) throw Error('Evidence export failed.');
const data = await r.json();
await mkdir('private-evidence', { recursive: true, mode: 0o700 });
const path = 'private-evidence/events-' + new Date().toISOString().replaceAll(':', '-') + '.json';
await writeFile(path, JSON.stringify(data, null, 2), { mode: 0o600 });
console.log('Aggregate event evidence saved. Reconcile revenue separately using provider exports.');

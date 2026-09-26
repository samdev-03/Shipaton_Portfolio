import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { brands } from '../shared/catalog.ts';
const marks = {
  rehearsal:
    '<path d="M260 295h504v350H470L300 760V645h-40z" rx="70"/><path d="M410 420v100m102-140v180m102-140v100" stroke="COLOR" stroke-width="38" stroke-linecap="round"/>',
  care: '<path d="M512 735C220 560 220 340 385 330c70 0 115 55 127 75 12-20 57-75 127-75 165 10 165 230-127 405z"/>',
  meal: '<path d="M270 700c-15-300 145-440 475-430 20 320-165 490-475 430z"/><path d="M320 660l345-305" stroke="COLOR" stroke-width="35" stroke-linecap="round"/>',
  quote:
    '<path d="M300 250h425v525l-70-45-75 45-70-45-75 45-70-45-65 45z"/><path d="M390 390h245M390 495h175M390 600h245" stroke="COLOR" stroke-width="35" stroke-linecap="round"/>',
};
for (const [id, b] of Object.entries(brands)) {
  const dir = `assets/brands/${id}`;
  await mkdir(dir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${b.color}"/><g fill="${b.ink}">${marks[id].replaceAll('COLOR', b.color)}</g></svg>`;
  await writeFile(dir + '/icon.svg', svg);
  await sharp(Buffer.from(svg))
    .flatten({ background: b.color })
    .png()
    .toFile(dir + '/icon.png');
  await sharp(Buffer.from(svg))
    .png()
    .toFile(dir + '/adaptive.png');
}
console.log('Four original icons generated at 1024 × 1024.');

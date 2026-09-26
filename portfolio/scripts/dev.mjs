import { spawn } from 'node:child_process';
const variant = process.argv[2] || 'rehearsal';
if (!['rehearsal', 'care', 'meal', 'quote'].includes(variant))
  throw Error('Choose rehearsal, care, meal or quote.');
const api = spawn(process.execPath, ['--env-file-if-exists=.env', 'server/index.mjs'], {
  stdio: 'inherit',
});
const expo = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['expo', 'start', '--web'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, APP_VARIANT: variant, PORTFOLIO_PREVIEW: '0' },
});
function stop() {
  api.kill();
  expo.kill();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
api.on('exit', () => expo.kill());
expo.on('exit', () => api.kill());

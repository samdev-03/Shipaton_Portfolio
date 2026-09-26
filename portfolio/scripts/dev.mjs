import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { loadEnvFile } from 'node:process';
try {
  loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const require = createRequire(import.meta.url);
const variant = process.argv[2] || 'rehearsal';
if (!['rehearsal', 'care', 'meal', 'quote'].includes(variant))
  throw Error('Choose rehearsal, care, meal or quote.');
const api = spawn(process.execPath, ['--env-file-if-exists=.env', 'server/index.mjs'], {
  stdio: 'inherit',
});
const expo = spawn(process.execPath, [require.resolve('expo/bin/cli'), 'start', '--web'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    APP_VARIANT: variant,
    PORTFOLIO_PREVIEW: '0',
    EXPO_PUBLIC_API_URL:
      process.env.EXPO_PUBLIC_API_URL || 'http://localhost:' + (process.env.PORT || '8787'),
  },
});
function stop() {
  api.kill();
  expo.kill();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
api.on('exit', () => expo.kill());
expo.on('exit', () => api.kill());

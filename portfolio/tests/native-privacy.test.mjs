import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('generated Rehearsal native configuration excludes advertising tracking', () => {
  const require = createRequire(import.meta.url);
  const expoCli = join(dirname(require.resolve('expo/package.json')), 'bin', 'cli');
  const config = JSON.parse(
    execFileSync(process.execPath, [expoCli, 'config', '--type', 'introspect', '--json'], {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
      encoding: 'utf8',
      env: {
        ...process.env,
        APP_VARIANT: 'rehearsal',
        APP_ENV: 'production',
        NODE_ENV: 'production',
        EXPO_NO_DOTENV: '1',
      },
      maxBuffer: 4 * 1024 * 1024,
    }),
  );
  const plist = config._internal.modResults.ios.infoPlist;
  assert.equal(Object.hasOwn(plist, 'NSUserTrackingUsageDescription'), false);
  assert.equal(Object.hasOwn(plist, 'NSAdvertisingAttributionReportEndpoint'), false);
  assert.equal((plist.SKAdNetworkItems ?? []).length, 0);
  assert.equal(
    plist.NSMicrophoneUsageDescription,
    'Record a practice response when you choose voice input.',
  );
  const permissions = config._internal.modResults.android.manifest.manifest['uses-permission'];
  const advertising = permissions.filter(
    (permission) => permission.$['android:name'] === 'com.google.android.gms.permission.AD_ID',
  );
  assert.ok(advertising.every((permission) => permission.$['tools:node'] === 'remove'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceSession } from '../src/lib/voice-session.ts';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function fixture(overrides = {}) {
  const events = [];
  let released = false;
  const touch = (name) => {
    if (released) throw Error('Native shared object has been released');
    events.push(name);
  };
  const recorder = {
    get uri() {
      touch('uri');
      return 'file:///private/capture.m4a';
    },
    async prepareToRecordAsync() {
      touch('prepare');
    },
    record() {
      touch('record');
    },
    async stop() {
      touch('stop');
    },
    ...overrides.recorder,
  };
  const session = createVoiceSession({
    recorder,
    initialUri: 'file:///private/capture.m4a',
    permission: async () => ({ granted: true }),
    recordingMode: async (enabled) => events.push(['mode', enabled]),
    remove: async (uri) => events.push(['remove', uri]),
    transcribe: async () => {
      events.push('transcribe');
      return 'A fictional response.';
    },
    onText: (text) => events.push(['text', text]),
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== 'recorder')),
  });
  return {
    session,
    events,
    release: () => {
      released = true;
    },
  };
}

test('finish-screen unmount cleans cached recording after Expo releases its native object', async () => {
  const f = fixture();
  await f.session.start();
  f.release();
  await assert.doesNotReject(f.session.dispose());
  assert.equal(f.session.isRecording, false);
  assert.deepEqual(f.events.slice(-2), [
    ['remove', 'file:///private/capture.m4a'],
    ['mode', false],
  ]);
  await f.session.finish();
  assert.equal(await f.session.start(), false);
});

test('denied microphone access never prepares, records or transcribes', async () => {
  const f = fixture({ permission: async () => ({ granted: false }) });
  await assert.rejects(f.session.start(), /keep typing/);
  assert.deepEqual(f.events, []);
  f.release();
  await assert.doesNotReject(f.session.dispose());
});

test('unmount while the permission prompt is open cannot start recording later', async () => {
  const pending = deferred();
  const f = fixture({ permission: () => pending.promise });
  const start = f.session.start();
  f.release();
  await f.session.dispose();
  pending.resolve({ granted: true });
  assert.equal(await start, false);
  assert.equal(f.events.includes('record'), false);
});

test('unmount during native preparation does not touch the released recorder afterward', async () => {
  const pending = deferred();
  const entered = deferred();
  const f = fixture({
    recorder: {
      prepareToRecordAsync: () => {
        entered.resolve();
        return pending.promise;
      },
    },
  });
  const start = f.session.start();
  await entered.promise;
  f.release();
  await f.session.dispose();
  pending.resolve();
  assert.equal(await start, false);
  assert.equal(f.events.includes('record'), false);
});

test('unmount during stop skips native URI lookup and transcription', async () => {
  const pending = deferred();
  const f = fixture({ recorder: { stop: () => pending.promise } });
  await f.session.start();
  const finish = f.session.finish();
  f.release();
  await f.session.dispose();
  pending.resolve();
  await assert.doesNotReject(finish);
  assert.equal(f.events.includes('transcribe'), false);
});

test('late transcription does not change an unmounted practice response', async () => {
  const pending = deferred();
  const entered = deferred();
  const f = fixture({
    transcribe: () => {
      entered.resolve();
      return pending.promise;
    },
  });
  await f.session.start();
  const finish = f.session.finish();
  await entered.promise;
  f.release();
  await f.session.dispose();
  pending.resolve('Late text');
  await finish;
  assert.equal(
    f.events.some((e) => Array.isArray(e) && e[0] === 'text'),
    false,
  );
});

test('background interruption discards audio without sending it for transcription', async () => {
  const f = fixture();
  await f.session.start();
  await f.session.finish(false);
  assert.equal(f.events.includes('stop'), true);
  assert.equal(f.events.includes('transcribe'), false);
  assert.equal(f.session.isRecording, false);
});

test('timer and button finishing together stop and transcribe only once', async () => {
  const f = fixture();
  await f.session.start();
  await Promise.all([f.session.finish(), f.session.finish()]);
  assert.equal(f.events.filter((e) => e === 'stop').length, 1);
  assert.equal(f.events.filter((e) => e === 'transcribe').length, 1);
  assert.equal(f.events.filter((e) => Array.isArray(e) && e[0] === 'text').length, 1);
});

test('transcription failure still removes recording and restores playback mode', async () => {
  const f = fixture({
    transcribe: async () => {
      throw Error('Service unavailable');
    },
  });
  await f.session.start();
  await assert.rejects(f.session.finish(), /Service unavailable/);
  assert.deepEqual(f.events.slice(-2), [
    ['remove', 'file:///private/capture.m4a'],
    ['mode', false],
  ]);
});

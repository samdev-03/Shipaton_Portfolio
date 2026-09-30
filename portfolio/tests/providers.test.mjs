import test from 'node:test';
import assert from 'node:assert/strict';
import { providers, providerConfig } from '../server/providers.mjs';
const ok = (data) => ({ ok: true, status: 200, json: async () => data });
test('RevenueCat rejects expired access and honors verified sandbox access for App Review', async () => {
  let expiry = new Date(Date.now() + 86400000).toISOString(),
    sandbox = false;
  const p = providers({ REHEARSAL_RC_SECRET_KEY: 'test', NODE_ENV: 'production' }, async () =>
    ok({
      subscriber: {
        entitlements: { rehearsal_pro: { expires_date: expiry, product_identifier: 'monthly' } },
        subscriptions: { monthly: { is_sandbox: sandbox } },
      },
    }),
  );
  assert.equal((await p.entitlement({ id: 'u', app: 'rehearsal' })).active, true);
  sandbox = true;
  assert.equal((await p.entitlement({ id: 'u', app: 'rehearsal' })).active, true);
  sandbox = false;
  expiry = '2020-01-01T00:00:00Z';
  assert.equal((await p.entitlement({ id: 'u', app: 'rehearsal' })).active, false);
  assert.deepEqual(providerConfig({ CARE_RC_APP_IDS: 'ios,android' }, 'care').rcAppIds, [
    'ios',
    'android',
  ]);
});
test('OneSignal targets only the account, with generic copy and stable idempotency', async () => {
  let captured;
  const p = providers(
    { CARE_ONESIGNAL_APP_ID: 'app', CARE_ONESIGNAL_REST_KEY: 'key' },
    async (url, opts) => {
      captured = JSON.parse(opts.body);
      return ok({ id: 'sent' });
    },
  );
  await p.notify({ id: 'person-id', app: 'care', private: 'do not send' }, { id: 'reminder-id' });
  assert.deepEqual(captured.include_aliases.external_id, ['person-id']);
  assert.equal(captured.idempotency_key, 'reminder-id');
  assert.ok(!JSON.stringify(captured).includes('do not send'));
});
test('AI enforces consent and structured, non-stored output; refuses malformed data', async () => {
  let calls = 0,
    captured,
    malformed = false;
  const p = providers({ OPENAI_API_KEY: 'test' }, async (url, opts) => {
    calls++;
    captured = JSON.parse(opts.body);
    return ok({
      output: [
        {
          content: [
            {
              type: 'output_text',
              text: malformed
                ? 'invalid'
                : JSON.stringify({
                    reply: 'Could we agree a deadline?',
                    feedback: {
                      clarity: 2,
                      empathy: 2,
                      specificity: 2,
                      strength: 'Clear request.',
                      next: 'Name a time.',
                    },
                  }),
            },
          ],
        },
      ],
    });
  });
  await assert.rejects(p.roleplay({ ai: 0 }, { counterpart: 'Manager' }, []));
  assert.equal(calls, 0);
  assert.match(
    (await p.roleplay({ ai: 1 }, { counterpart: 'Manager' }, [{ role: 'user', text: 'Hi' }])).reply,
    /deadline/,
  );
  assert.equal(captured.store, false);
  assert.equal(captured.text.format.strict, true);
  malformed = true;
  await assert.rejects(p.roleplay({ ai: 1 }, { counterpart: 'Manager' }, []));
});
test('provider failure does not silently unlock premium', async () => {
  const p = providers({ REHEARSAL_RC_SECRET_KEY: 'test' }, async () => ({
    ok: false,
    status: 500,
  }));
  await assert.rejects(p.entitlement({ id: 'u', app: 'rehearsal' }));
  assert.deepEqual(await providers({}).entitlement({ id: 'u', app: 'rehearsal' }), {
    active: false,
    expiresAt: null,
  });
});
test('provider diagnostics exclude secrets and content, and preserve audio format', async (t) => {
  const logged = [];
  t.mock.method(console, 'error', (line) => logged.push(JSON.parse(line)));
  const p = providers({ OPENAI_API_KEY: 'secret-key' }, async () => ({
    ok: false,
    status: 429,
    json: async () => ({
      error: { code: 'insufficient_quota', message: 'secret-key private-content' },
    }),
  }));
  await assert.rejects(
    p.roleplay({ ai: 1 }, { counterpart: 'Manager' }, [{ role: 'user', text: 'private-content' }]),
  );
  assert.deepEqual(logged, [
    {
      event: 'provider_request_failed',
      provider: 'api.openai.com',
      operation: 'roleplay',
      status: 429,
      code: 'insufficient_quota',
    },
  ]);
  for (const [mime, extension] of [
    ['audio/wav', 'wav'],
    ['audio/mpeg', 'mp3'],
    ['audio/mp4', 'm4a'],
    ['audio/webm', 'webm'],
    ['audio/m4a', 'm4a'],
  ]) {
    const audioProvider = providers({ OPENAI_API_KEY: 'test' }, async (_url, opts) => {
      assert.equal(opts.body.get('file').name, 'practice.' + extension);
      assert.equal(opts.body.get('file').type, mime === 'audio/mp4' ? 'audio/m4a' : mime);
      return ok({ text: 'A fictional practice response.' });
    });
    assert.equal(
      await audioProvider.transcribe({ ai: 1 }, new Uint8Array([0]), mime),
      'A fictional practice response.',
    );
  }
});

test('billing diagnostics distinguish credit and spend limits while suppressing unknown details', async (t) => {
  const logged = [];
  t.mock.method(console, 'error', (line) => logged.push(JSON.parse(line)));
  for (const [code, type, expected] of [
    ['credit_balance_exhausted', 'insufficient_quota', 'credit_balance_exhausted'],
    [
      'organization_usage_limit_exceeded',
      'insufficient_quota',
      'organization_usage_limit_exceeded',
    ],
    [
      'organization_spend_limit_exceeded',
      'insufficient_quota',
      'organization_spend_limit_exceeded',
    ],
    ['project_spend_limit_exceeded', 'insufficient_quota', 'project_spend_limit_exceeded'],
    ['private-org-id', 'insufficient_quota', 'insufficient_quota'],
    ['private-org-id', 'private-content', 'unclassified'],
  ]) {
    const p = providers({ OPENAI_API_KEY: 'private-api-key' }, async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { code, type, message: 'private-api-key private-content' } }),
    }));
    await assert.rejects(p.roleplay({ ai: 1 }, { counterpart: 'Manager' }, []));
    assert.equal(logged.at(-1).code, expected);
  }
  assert.doesNotMatch(JSON.stringify(logged), /private-/);
});

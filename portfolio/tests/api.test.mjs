import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../server/app.mjs';
import { createStore } from '../server/store.mjs';
const password = 'Test-only-password-2026';
async function fixture(t, overrides = {}) {
  let clock = Date.now(),
    pushCalls = 0;
  const paid = new Set(),
    deleted = [];
  const env = {
    PUBLIC_ORIGIN: 'http://localhost:8787',
    WEBHOOK_SECRET: 'w'.repeat(40),
    OPS_TOKEN: 'o'.repeat(40),
    ...overrides,
  };
  for (const p of ['REHEARSAL', 'CARE', 'MEAL', 'QUOTE'])
    Object.assign(env, {
      [p + '_RC_APP_IDS']: p + '-ios,' + p + '-android',
      [p + '_ONESIGNAL_APP_ID']: 'test-app',
      [p + '_ONESIGNAL_REST_KEY']: 'test-key',
      [p + '_FUNNEL_URL']: 'https://signup.cat/example',
      [p + '_LAYERS_APP_ID']: 'test-layers',
    });
  const providers = {
    entitlement: async (u) => ({ active: paid.has(u.id), expiresAt: clock + 86400000 }),
    notify: async () => {
      pushCalls++;
      if (pushCalls === 1) throw Error('retry');
      return { id: 'provider-notification' };
    },
    deleteUser: async (app, id, p) => deleted.push({ app, id, p }),
    roleplay: async () => {
      throw Error('Unexpected AI call');
    },
    transcribe: async () => {
      throw Error('Unexpected audio call');
    },
  };
  const app = createApp({
    env,
    store: createStore(':memory:', 'a'.repeat(64)),
    providers,
    now: () => clock,
  });
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + app.server.address().port;
  t.after(() => app.close());
  async function call(path, method = 'GET', data, who, headers = {}) {
    const r = await fetch(base + path, {
      method,
      headers: {
        'X-App-ID': who?.app || 'rehearsal',
        'X-Client': 'native',
        ...(who?.token ? { Authorization: 'Bearer ' + who.token } : {}),
        ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    return { status: r.status, body: await r.json(), headers: r.headers };
  }
  async function register(variant = 'rehearsal') {
    const email = randomUUID() + '@example.test',
      r = await call(
        '/v1/auth/register',
        'POST',
        { name: 'Jamie', email, password, accepted: true },
        { app: variant },
      );
    assert.equal(r.status, 201);
    return { ...r.body, app: variant, email };
  }
  return {
    ...app,
    base,
    call,
    register,
    paid,
    deleted,
    advance: (n) => (clock += n),
    now: () => clock,
    pushCalls: () => pushCalls,
  };
}
test('auth isolates apps, encrypts content, and recovery invalidates prior sessions', async (t) => {
  const f = await fixture(t),
    u = await f.register(),
    other = await f.register();
  assert.equal((await f.call('/v1/me', 'GET', undefined, { ...u, app: 'care' })).status, 401);
  const r = await f.call(
    '/v1/rehearsals',
    'POST',
    { scenarioId: 'workload', mode: 'guided', confidence: 2 },
    u,
  );
  assert.equal(r.status, 201);
  assert.equal((await f.call('/v1/rehearsals/' + r.body.id, 'GET', undefined, other)).status, 404);
  const raw = f.store.get('SELECT payload FROM records WHERE id=?', r.body.id).payload;
  assert.ok(!raw.includes('workload'));
  assert.equal(f.store.open(raw).scenarioId, 'workload');
  const recovery = await f.call('/v1/auth/recover', 'POST', {
    email: u.email,
    password: 'Replacement-password-2026',
    recoveryCode: u.recoveryCode,
  });
  assert.equal(recovery.status, 200);
  assert.notEqual(recovery.body.recoveryCode, u.recoveryCode);
  assert.equal((await f.call('/v1/me', 'GET', undefined, u)).status, 401);
  assert.equal(
    (await f.call('/v1/me', 'GET', undefined, { ...u, token: recovery.body.token })).status,
    200,
  );
});
test('practice retry truncates from chosen user turn and rejects stale mutations', async (t) => {
  const f = await fixture(t),
    u = await f.register(),
    p = (
      await f.call(
        '/v1/rehearsals',
        'POST',
        { scenarioId: 'workload', mode: 'guided', confidence: 2 },
        u,
      )
    ).body;
  const first = await f.call(
    `/v1/rehearsals/${p.id}/turn`,
    'POST',
    { text: 'I cannot do it.', version: 1 },
    u,
  );
  assert.equal(first.body.messages.length, 3);
  assert.equal(
    (await f.call(`/v1/rehearsals/${p.id}/turn`, 'POST', { text: 'stale', version: 1 }, u)).status,
    409,
  );
  const retry = await f.call(
    `/v1/rehearsals/${p.id}/turn`,
    'POST',
    { text: 'I understand. Could we move the deck to Friday?', version: 2, retryIndex: 1 },
    u,
  );
  assert.equal(retry.body.messages.length, 3);
  assert.ok(!JSON.stringify(retry.body).includes('I cannot do it.'));
  assert.equal(
    (await f.call(`/v1/rehearsals/${p.id}/complete`, 'POST', { confidence: 4 }, u)).body.status,
    'complete',
  );
  assert.equal(
    (await f.call(`/v1/rehearsals/${p.id}/turn`, 'POST', { text: 'late', version: 4 }, u)).status,
    409,
  );
});
test('premium needs provider entitlement; authenticated webhook reconciles and deduplicates', async (t) => {
  const f = await fixture(t),
    u = await f.register();
  const premium = () =>
    f.call('/v1/rehearsals', 'POST', { scenarioId: 'raise', mode: 'guided', confidence: 3 }, u);
  assert.equal((await premium()).status, 402);
  f.paid.add(u.user.id);
  const data = {
    event: {
      id: randomUUID(),
      app_id: 'REHEARSAL-ios',
      app_user_id: u.user.id,
      type: 'INITIAL_PURCHASE',
      environment: 'PRODUCTION',
    },
  };
  assert.equal((await f.call('/v1/webhooks/revenuecat', 'POST', data)).status, 401);
  const h = { Authorization: 'Bearer ' + 'w'.repeat(40) };
  assert.equal((await f.call('/v1/webhooks/revenuecat', 'POST', data, undefined, h)).status, 200);
  assert.equal(
    (await f.call('/v1/webhooks/revenuecat', 'POST', data, undefined, h)).body.duplicate,
    true,
  );
  assert.equal((await premium()).status, 201);
  f.paid.delete(u.user.id);
  await f.call('/v1/billing/sync', 'POST', {}, u);
  assert.equal((await premium()).status, 402);
});
test('production reconciles sandbox review purchases without counting purchase evidence', async (t) => {
  const f = await fixture(t, { NODE_ENV: 'production', PUBLIC_ORIGIN: 'https://example.test' });
  const u = await f.register();
  await f.call('/v1/preferences', 'PUT', { analytics: true, notifications: false, ai: false }, u);
  const premium = () =>
    f.call('/v1/rehearsals', 'POST', { scenarioId: 'raise', mode: 'guided', confidence: 3 }, u);
  assert.equal((await premium()).status, 402);
  f.paid.add(u.user.id);
  const event = {
    id: randomUUID(),
    app_id: 'REHEARSAL-ios',
    app_user_id: u.user.id,
    type: 'INITIAL_PURCHASE',
    environment: 'SANDBOX',
  };
  const send = () =>
    f.call('/v1/webhooks/revenuecat', 'POST', { event }, undefined, {
      Authorization: 'Bearer ' + 'w'.repeat(40),
    });
  assert.equal((await send()).status, 200);
  assert.equal((await premium()).status, 201);
  assert.equal(f.store.get("SELECT COUNT(*) AS n FROM events WHERE name='purchase_verified'").n, 0);
  assert.equal((await send()).body.duplicate, true);
  event.id = randomUUID();
  event.environment = 'PRODUCTION';
  assert.equal((await send()).status, 200);
  assert.equal(f.store.get("SELECT COUNT(*) AS n FROM events WHERE name='purchase_verified'").n, 1);
  assert.equal((await send()).body.duplicate, true);
  assert.equal(f.store.get("SELECT COUNT(*) AS n FROM events WHERE name='purchase_verified'").n, 1);
  f.paid.delete(u.user.id);
  event.id = randomUUID();
  event.environment = 'SANDBOX';
  event.type = 'EXPIRATION';
  assert.equal((await send()).status, 200);
  assert.equal((await premium()).status, 402);
});
test('care invites are single-use; races and handoffs preserve acknowledgment', async (t) => {
  const f = await fixture(t),
    a = await f.register('care'),
    b = await f.register('care'),
    c = await f.register('care'),
    circle = (await f.call('/v1/circles', 'POST', { name: 'Sunday' }, a)).body;
  const invite = (await f.call(`/v1/circles/${circle.id}/invite`, 'POST', {}, a)).body;
  assert.equal((await f.call('/v1/circles/join', 'POST', { code: invite.code }, b)).status, 200);
  assert.equal((await f.call('/v1/circles/join', 'POST', { code: invite.code }, c)).status, 404);
  assert.equal((await f.call('/v1/circles/' + circle.id, 'GET', undefined, c)).status, 404);
  const task = (
      await f.call(
        `/v1/circles/${circle.id}/tasks`,
        'POST',
        { title: 'Groceries', note: 'Fruit' },
        a,
      )
    ).body,
    path = `/v1/circles/${circle.id}/tasks/${task.id}`;
  const claims = await Promise.all([
    f.call(path, 'POST', { action: 'claim', version: 1 }, a),
    f.call(path, 'POST', { action: 'claim', version: 1 }, b),
  ]);
  assert.deepEqual(claims.map((x) => x.status).sort(), [200, 409]);
  const owner = claims[0].status === 200 ? a : b,
    recipient = owner === a ? b : a;
  assert.equal((await f.call(path, 'POST', { action: 'complete', version: 2 }, owner)).status, 409);
  assert.equal(
    (await f.call(path, 'POST', { action: 'acknowledge', version: 2 }, owner)).status,
    200,
  );
  assert.equal(
    (
      await f.call(
        path,
        'POST',
        { action: 'handoff', version: 3, target: recipient.user.id },
        owner,
      )
    ).status,
    200,
  );
  assert.equal(
    (await f.call(path, 'POST', { action: 'complete', version: 4 }, recipient)).status,
    409,
  );
  await f.call(path, 'POST', { action: 'acknowledge', version: 4 }, recipient);
  assert.equal(
    (await f.call(path, 'POST', { action: 'complete', version: 5 }, recipient)).body.status,
    'done',
  );
});
test('meal saves recompute suggestions, forbid forgery and enforce Pro planning', async (t) => {
  const f = await fixture(t),
    u = await f.register('meal'),
    input = {
      name: 'Soup',
      pantry: 'cucumber lemon',
      budgetCents: 150,
      minutes: 5,
      equipment: [],
      avoid: ['milk'],
      vegan: true,
    };
  const options = (await f.call('/v1/meals/suggest', 'POST', input, u)).body.items;
  assert.ok(options.length);
  assert.ok(options.every((p) => !p.allergens.includes('milk')));
  assert.equal((await f.call('/v1/meals', 'POST', { input, selected: ['yogurt'] }, u)).status, 400);
  const saved = (await f.call('/v1/meals', 'POST', { input, selected: [options[0].id] }, u)).body;
  assert.equal(
    (await f.call(`/v1/meals/${saved.id}/plan`, 'PUT', { date: '2026-09-30' }, u)).status,
    402,
  );
  f.paid.add(u.user.id);
  await f.call('/v1/billing/sync', 'POST', {}, u);
  assert.equal(
    (await f.call(`/v1/meals/${saved.id}/plan`, 'PUT', { date: '2026-02-30' }, u)).status,
    400,
  );
  assert.equal(
    (await f.call(`/v1/meals/${saved.id}/plan`, 'PUT', { date: '2026-09-30' }, u)).status,
    200,
  );
});
test('quotes enforce exact totals, token access, expiry and immutable acceptance', async (t) => {
  const f = await fixture(t),
    u = await f.register('quote'),
    other = await f.register('quote');
  const input = {
    business: 'Clear House',
    customer: 'Pat',
    scope: 'Kitchen only',
    notes: 'Arrange payment directly',
    validUntil: new Date(f.now() + 2 * 86400000).toISOString().slice(0, 10),
    items: [{ description: 'Clean', quantity: 2, unitCents: 333 }],
    taxBps: 700,
    depositPercent: 25,
  };
  const q = (await f.call('/v1/quotes', 'POST', input, u)).body;
  assert.equal(q.totalCents, 713);
  assert.equal((await f.call(`/v1/quotes/${q.id}/share`, 'POST', {}, other)).status, 404);
  const share = (await f.call(`/v1/quotes/${q.id}/share`, 'POST', {}, u)).body,
    path = '/v1/public/quotes/' + share.token;
  assert.equal((await f.call(path)).status, 200);
  assert.equal(
    (await f.call(path + '/accept', 'POST', { name: 'Pat', accepted: false })).status,
    400,
  );
  assert.equal(
    (await f.call(path + '/accept', 'POST', { name: 'Pat', accepted: true })).body.status,
    'accepted',
  );
  assert.equal((await f.call(`/v1/quotes/${q.id}/share`, 'POST', {}, u)).status, 409);
  f.advance(3 * 86400000);
  assert.equal((await f.call(path)).status, 410);
  await f.call(`/v1/quotes/${q.id}/revoke`, 'POST', {}, u);
  assert.equal((await f.call(path)).status, 404);
});
test('reminders require consent, retry safely and cancel after revocation', async (t) => {
  const f = await fixture(t),
    u = await f.register(),
    id = randomUUID(),
    dueAt = new Date(f.now() + 120000).toISOString();
  assert.equal((await f.call('/v1/reminders', 'POST', { id, dueAt }, u)).status, 403);
  await f.call('/v1/preferences', 'PUT', { analytics: false, notifications: true, ai: false }, u);
  assert.equal((await f.call('/v1/reminders', 'POST', { id, dueAt }, u)).status, 201);
  assert.equal((await f.call('/v1/reminders', 'POST', { id, dueAt }, u)).status, 200);
  f.advance(121000);
  await f.tick();
  assert.equal(f.store.get('SELECT state FROM reminders WHERE id=?', id).state, 'pending');
  f.advance(61000);
  await f.tick();
  assert.equal(f.store.get('SELECT state FROM reminders WHERE id=?', id).state, 'sent');
  await f.call(
    '/v1/reminders',
    'POST',
    { id: randomUUID(), dueAt: new Date(f.now() + 120000).toISOString() },
    u,
  );
  await f.call('/v1/preferences', 'PUT', { analytics: false, notifications: false, ai: false }, u);
  f.advance(121000);
  await f.tick();
  assert.equal(f.pushCalls(), 2);
});
test('account deletion erases content and queues provider requests including manual Layers', async (t) => {
  const f = await fixture(t),
    u = await f.register();
  await f.call(
    '/v1/rehearsals',
    'POST',
    { scenarioId: 'workload', mode: 'guided', confidence: 3 },
    u,
  );
  assert.equal((await f.call('/v1/account', 'DELETE', { password: 'bad' }, u)).status, 403);
  assert.equal((await f.call('/v1/account', 'DELETE', { password }, u)).status, 200);
  assert.equal((await f.call('/v1/me', 'GET', undefined, u)).status, 401);
  assert.equal(f.store.get('SELECT COUNT(*) n FROM records').n, 0);
  await f.tick();
  assert.equal(f.deleted.length, 2);
  assert.equal(f.store.get('SELECT * FROM deletion_jobs').provider, 'layers');
  assert.equal((await f.call('/ops/privacy-requests')).status, 401);
});
test('web cookies, cross-origin requests, fabricated events and oversized input', async (t) => {
  const f = await fixture(t),
    u = await f.register();
  const login = await f.call('/v1/auth/login', 'POST', { email: u.email, password }, undefined, {
    'X-Client': 'web',
  });
  assert.equal(login.body.token, undefined);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.equal(
    (
      await f.call(
        '/v1/preferences',
        'PUT',
        { analytics: true, notifications: false, ai: false },
        u,
        { Origin: 'https://evil.example' },
      )
    ).status,
    403,
  );
  assert.equal(
    (await f.call('/v1/events', 'POST', { id: randomUUID(), name: 'purchase_verified' }, u)).status,
    400,
  );
  assert.equal(
    (await f.call('/v1/rehearsals', 'POST', { oversized: 'x'.repeat(300000) }, u)).status,
    413,
  );
  const funnel = (await f.call('/v1/funnel', 'GET', undefined, u)).body.url;
  assert.ok(funnel.endsWith('/' + u.user.id));
  assert.ok(!funnel.includes(u.email));
});

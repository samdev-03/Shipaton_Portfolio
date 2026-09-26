import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { APP_IDS, brands, scenarios, growthEvents } from '../shared/catalog.ts';
import {
  experimentVariant,
  guidedFeedback,
  guidedReply,
  mealPatches,
  quoteTotals,
  taskTransition,
  validDate,
} from '../shared/domain.ts';
import { createStore, hash, token, secureEqual, passwordHash, passwordValid } from './store.mjs';
import { providers as makeProviders, providerConfig } from './providers.mjs';
import { schemas, parse, fail } from './validation.mjs';
import { tick } from './worker.mjs';
const day = 86400000;
export function createApp({
  env = process.env,
  store: inStore,
  providers: inProviders,
  now = () => Date.now(),
} = {}) {
  const prod = env.NODE_ENV === 'production';
  if (
    prod &&
    (!env.PUBLIC_ORIGIN?.startsWith('https://') ||
      !env.WEBHOOK_SECRET ||
      env.WEBHOOK_SECRET.length < 32 ||
      !env.OPS_TOKEN ||
      env.OPS_TOKEN.length < 32)
  )
    throw Error('Production requires HTTPS and strong WEBHOOK_SECRET / OPS_TOKEN.');
  const store =
      inStore ||
      createStore(
        env.DB_PATH || './data/portfolio.sqlite',
        env.DATA_KEY || (!prod ? '1'.repeat(64) : ''),
      ),
    provider = inProviders || makeProviders(env),
    origin = env.PUBLIC_ORIGIN || 'http://localhost:8787';
  const allowed = new Set([
      origin,
      ...(env.ALLOWED_ORIGINS || (!prod ? 'http://localhost:8081,http://localhost:8082' : ''))
        .split(',')
        .filter(Boolean),
    ]),
    cookie = prod ? '__Host-session' : 'session',
    locks = new Set();
  const me = (u) => ({
    id: u.id,
    app: u.app,
    ...store.open(u.profile),
    preferences: { analytics: !!u.analytics, notifications: !!u.notifications, ai: !!u.ai },
    variant: experimentVariant(u.id),
  });
  const rec = (r) => ({
    id: r.id,
    ...store.open(r.payload),
    version: r.version,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });
  const own = (id, u, kind) => {
    const r = store.get(
      'SELECT * FROM records WHERE id=? AND user_id=? AND kind=?',
      id,
      u.id,
      kind,
    );
    if (!r) fail(404, 'Not found.');
    return r;
  };
  const event = (u, name) => {
    if (u.analytics)
      store.run(
        'INSERT INTO events VALUES(?,?,?,?,?,?)',
        randomUUID(),
        u.id,
        u.app,
        name,
        experimentVariant(u.id),
        now(),
      );
  };
  const insert = (u, kind, data) => {
    const id = randomUUID();
    store.run(
      'INSERT INTO records VALUES(?,?,?,?,1,?,?)',
      id,
      u.id,
      kind,
      store.seal(data),
      now(),
      now(),
    );
    return rec(store.get('SELECT * FROM records WHERE id=?', id));
  };
  function limit(key, max, window) {
    const k = hash(key),
      r = store.get('SELECT * FROM limits WHERE key=?', k);
    if (!r || r.expires_at <= now()) {
      store.run('INSERT OR REPLACE INTO limits VALUES(?,1,?)', k, now() + window);
      return;
    }
    if (r.count >= max) fail(429, 'Too many requests. Please try again later.');
    store.run('UPDATE limits SET count=count+1 WHERE key=?', k);
  }
  async function entitlement(u, force = false) {
    let r = store.get('SELECT * FROM entitlements WHERE user_id=?', u.id);
    if (force || !r || now() - r.checked_at > 300000) {
      const e = await provider.entitlement(u);
      store.run(
        'INSERT OR REPLACE INTO entitlements VALUES(?,?,?,?)',
        u.id,
        e.active ? 1 : 0,
        e.expiresAt ?? null,
        now(),
      );
      r = store.get('SELECT * FROM entitlements WHERE user_id=?', u.id);
    }
    return {
      active: !!r.active && (r.expires_at === null || r.expires_at > now()),
      expiresAt: r.expires_at,
    };
  }
  async function requirePro(u) {
    if (!(await entitlement(u)).active) fail(402, 'This feature is included with Pro.');
  }
  const member = (cid, u) => {
    if (!store.get('SELECT 1 FROM members WHERE circle_id=? AND user_id=?', cid, u.id))
      fail(404, 'Circle not found.');
    return store.get('SELECT * FROM circles WHERE id=?', cid);
  };
  const task = (r) => ({
    id: r.id,
    ...store.open(r.payload),
    status: r.status,
    assignee: r.assignee,
    version: r.version,
  });
  const quote = (r) => ({
    id: r.id,
    ...store.open(r.payload),
    status: r.status,
    accepted: r.accepted ? store.open(r.accepted) : null,
  });
  const server = createServer(async (req, res) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Frame-Options', 'DENY');
    if (prod) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    const json = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, origin),
        path = url.pathname,
        method = req.method,
        app = req.headers['x-app-id'] || 'rehearsal';
      if (req.headers.origin && !allowed.has(req.headers.origin))
        fail(403, 'Origin is not allowed.');
      if (req.headers.origin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
      }
      if (method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-App-ID,X-Client',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        });
        res.end();
        return;
      }
      const ip =
        env.TRUST_PROXY === '1'
          ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress)
              .split(',')[0]
              .trim()
          : req.socket.remoteAddress;
      limit('ip:' + ip, 600, 60000);
      async function raw(max = 262144) {
        if (Number(req.headers['content-length']) > max) {
          req.resume();
          fail(413, 'Request is too large.');
        }
        let size = 0,
          parts = [];
        for await (const part of req) {
          size += part.length;
          if (size <= max) parts.push(part);
          else parts = [];
        }
        if (size > max) fail(413, 'Request is too large.');
        return Buffer.concat(parts);
      }
      async function body() {
        if (!String(req.headers['content-type']).startsWith('application/json'))
          fail(415, 'Use JSON for this request.');
        try {
          return JSON.parse((await raw()).toString());
        } catch (e) {
          if (e.status) throw e;
          fail(400, 'Invalid JSON.');
        }
      }
      function setSession(u) {
        const t = token();
        store.run('INSERT INTO sessions VALUES(?,?,?)', hash(t), u.id, now() + 30 * day);
        res.setHeader(
          'Set-Cookie',
          `${cookie}=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${prod ? '; Secure' : ''}`,
        );
        return req.headers['x-client'] === 'native' ? t : undefined;
      }
      if (path === '/healthz' || path === '/readyz') {
        store.get('SELECT 1');
        json({ ok: true });
        return;
      }
      if (path.startsWith('/ops/')) {
        if (!env.OPS_TOKEN || !secureEqual(req.headers.authorization, 'Bearer ' + env.OPS_TOKEN))
          fail(401, 'Unauthorized.');
        if (path === '/ops/evidence') {
          json({
            generatedAt: new Date(now()).toISOString(),
            source: 'Consenting first-party events, not a revenue ledger',
            events: store.all(
              'SELECT app,name,variant,COUNT(*) AS events,COUNT(DISTINCT user_id) AS users FROM events GROUP BY app,name,variant',
            ),
          });
          return;
        }
        if (path === '/ops/privacy-requests' && method === 'GET') {
          json({ items: store.all('SELECT * FROM deletion_jobs') });
          return;
        }
        if (path.startsWith('/ops/privacy-requests/') && method === 'DELETE') {
          store.run(
            "DELETE FROM deletion_jobs WHERE id=? AND state='manual'",
            path.split('/').pop(),
          );
          json({ ok: true });
          return;
        }
        fail(404, 'Not found.');
      }
      if (path === '/v1/webhooks/revenuecat' && method === 'POST') {
        if (
          !env.WEBHOOK_SECRET ||
          !secureEqual(req.headers.authorization, 'Bearer ' + env.WEBHOOK_SECRET)
        )
          fail(401, 'Unauthorized.');
        const b = await body(),
          e = b.event;
        if (!e || typeof e.id !== 'string' || e.id.length > 200 || typeof e.app_id !== 'string')
          fail(400, 'Invalid webhook.');
        if (store.get('SELECT 1 FROM webhooks WHERE id=?', e.id)) {
          json({ ok: true, duplicate: true });
          return;
        }
        const target = APP_IDS.find((x) => providerConfig(env, x).rcAppIds.includes(e.app_id));
        if (!target) fail(400, 'Unrecognized RevenueCat app.');
        if (locks.has('hook:' + e.id)) fail(409, 'Webhook is already processing.');
        locks.add('hook:' + e.id);
        try {
          const ids = [
            e.app_user_id,
            ...(Array.isArray(e.aliases) ? e.aliases : []),
            ...(Array.isArray(e.transferred_from) ? e.transferred_from : []),
            ...(Array.isArray(e.transferred_to) ? e.transferred_to : []),
          ];
          for (const id of new Set(ids.filter((x) => typeof x === 'string').slice(0, 30))) {
            const u = store.get('SELECT * FROM users WHERE id=? AND app=?', id, target);
            if (u) {
              const access = await entitlement(u, true);
              if (
                access.active &&
                e.environment === 'PRODUCTION' &&
                ['INITIAL_PURCHASE', 'RENEWAL'].includes(e.type)
              )
                event(u, 'purchase_verified');
            }
          }
          store.run('INSERT INTO webhooks VALUES(?,?)', e.id, now());
          json({ ok: true });
        } finally {
          locks.delete('hook:' + e.id);
        }
        return;
      }
      const publicQuote = path.match(/^\/v1\/public\/quotes\/([\w-]{40,60})(\/accept)?$/);
      if (publicQuote) {
        const r = store.get('SELECT * FROM quotes WHERE share_hash=?', hash(publicQuote[1]));
        if (!r) fail(404, 'This approval link is unavailable.');
        const d = store.open(r.payload);
        if (now() > Date.parse(d.validUntil + 'T23:59:59.999Z'))
          fail(410, 'This quote has expired. Ask for a new quote.');
        if (method === 'GET' && !publicQuote[2]) {
          json(quote(r));
          return;
        }
        if (method === 'POST' && publicQuote[2]) {
          const input = parse(schemas.accept, await body());
          if (r.status !== 'accepted') {
            store.run(
              "UPDATE quotes SET status='accepted',accepted=? WHERE id=? AND status!='accepted'",
              store.seal({ name: input.name, at: now(), accepted: true }),
              r.id,
            );
            const owner = store.get('SELECT * FROM users WHERE id=?', r.user_id);
            if (owner) event(owner, 'quote_accepted');
          }
          json(quote(store.get('SELECT * FROM quotes WHERE id=?', r.id)));
          return;
        }
        fail(405, 'Method not allowed.');
      }
      if (!path.startsWith('/v1/')) {
        if (method !== 'GET' && method !== 'HEAD') fail(405, 'Method not allowed.');
        const root = resolve(env.WEB_ROOT || 'dist');
        let file = resolve(root, '.' + decodeURIComponent(path));
        if (file !== root && !file.startsWith(root + sep)) fail(404, 'Not found.');
        try {
          if (!(await stat(file)).isFile()) file = resolve(root, 'index.html');
        } catch {
          file = resolve(root, 'index.html');
        }
        let content;
        try {
          content = await readFile(file);
        } catch {
          fail(404, 'Build the web companion first with npm run build:web.');
        }
        const types = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.ttf': 'font/ttf',
          '.ico': 'image/x-icon',
          '.json': 'application/json',
        };
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
        );
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
        res.end(method === 'HEAD' ? undefined : content);
        return;
      }
      if (!APP_IDS.includes(app)) fail(400, 'Unknown app.');
      const config = providerConfig(env, app);
      if (path === '/v1/config') {
        json({
          app,
          name: brands[app].name,
          pushAvailable: !!(config.oneId && config.oneKey),
          aiAvailable: !!env.OPENAI_API_KEY,
          funnelAvailable: !!config.funnel,
        });
        return;
      }
      if (path.startsWith('/v1/auth/') && method === 'POST') {
        limit('auth:' + ip, 20, 15 * 60000);
        const kind = path.split('/').pop();
        if (!['register', 'login', 'recover'].includes(kind)) fail(404, 'Not found.');
        const input = parse(schemas[kind], await body()),
          emailHash = hash(app + ':' + input.email);
        let u = store.get('SELECT * FROM users WHERE app=? AND email_hash=?', app, emailHash),
          recoveryCode;
        if (kind === 'register') {
          if (u) fail(409, 'An account already exists. Sign in or use your recovery code.');
          const id = randomUUID();
          recoveryCode = token();
          const ph = await passwordHash(input.password);
          try {
            store.run(
              'INSERT INTO users(id,app,email_hash,profile,password,recovery,created_at) VALUES(?,?,?,?,?,?,?)',
              id,
              app,
              emailHash,
              store.seal({ name: input.name, email: input.email }),
              ph,
              hash(recoveryCode),
              now(),
            );
          } catch {
            fail(409, 'An account already exists.');
          }
          u = store.get('SELECT * FROM users WHERE id=?', id);
        } else if (kind === 'login') {
          if (!u || !(await passwordValid(input.password, u.password)))
            fail(401, 'Email or password is incorrect.');
        } else {
          if (!u || !secureEqual(hash(input.recoveryCode), u.recovery))
            fail(401, 'Recovery details are incorrect.');
          recoveryCode = token();
          const ph = await passwordHash(input.password);
          store.transaction(() => {
            store.run(
              'UPDATE users SET password=?,recovery=? WHERE id=?',
              ph,
              hash(recoveryCode),
              u.id,
            );
            store.run('DELETE FROM sessions WHERE user_id=?', u.id);
          });
        }
        json({ user: me(u), token: setSession(u), recoveryCode }, kind === 'register' ? 201 : 200);
        return;
      }
      const bearer = String(req.headers.authorization || '').startsWith('Bearer ')
          ? String(req.headers.authorization).slice(7)
          : '',
        fromCookie = String(req.headers.cookie || '')
          .split(';')
          .map((s) => s.trim())
          .find((s) => s.startsWith(cookie + '='))
          ?.slice(cookie.length + 1),
        session = hash(bearer || fromCookie || '');
      const u = store.get(
        'SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.hash=? AND s.expires_at>? AND u.app=?',
        session,
        now(),
        app,
      );
      if (!u) fail(401, 'Please sign in.');
      limit('user:' + u.id, 240, 60000);
      if (path === '/v1/me') {
        json({ user: me(u), entitlement: await entitlement(u) });
        return;
      }
      if (path === '/v1/logout' && method === 'POST') {
        store.run('DELETE FROM sessions WHERE hash=?', session);
        res.setHeader(
          'Set-Cookie',
          `${cookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${prod ? '; Secure' : ''}`,
        );
        json({ ok: true });
        return;
      }
      if (path === '/v1/preferences' && method === 'PUT') {
        const b = parse(schemas.preferences, await body());
        store.transaction(() => {
          store.run(
            'UPDATE users SET analytics=?,notifications=?,ai=? WHERE id=?',
            +b.analytics,
            +b.notifications,
            +b.ai,
            u.id,
          );
          if (!b.notifications)
            store.run(
              "UPDATE reminders SET state='cancelled' WHERE user_id=? AND state IN ('pending','sending')",
              u.id,
            );
        });
        json({ ok: true });
        return;
      }
      if (path === '/v1/export') {
        json({
          user: me(u),
          records: store.all('SELECT * FROM records WHERE user_id=?', u.id).map(rec),
          quotes: store.all('SELECT * FROM quotes WHERE user_id=?', u.id).map(quote),
          circles: store
            .all(
              'SELECT c.* FROM circles c JOIN members m ON m.circle_id=c.id WHERE m.user_id=?',
              u.id,
            )
            .map((c) => ({
              id: c.id,
              ...store.open(c.payload),
              tasks: store.all('SELECT * FROM tasks WHERE circle_id=?', c.id).map(task),
            })),
          reminders: store.all('SELECT id,due_at,state FROM reminders WHERE user_id=?', u.id),
        });
        return;
      }
      if (path === '/v1/account' && method === 'DELETE') {
        const b = await body();
        if (
          typeof b.password !== 'string' ||
          b.password.length > 128 ||
          !(await passwordValid(b.password, u.password))
        )
          fail(403, 'Confirm your password.');
        store.transaction(() => {
          for (const p of ['revenuecat', 'onesignal', ...(config.layersId ? ['layers'] : [])])
            store.run(
              'INSERT INTO deletion_jobs VALUES(?,?,?,?,?,0,?)',
              randomUUID(),
              app,
              u.id,
              p,
              p === 'layers' ? 'manual' : 'pending',
              now(),
            );
          store.run(
            "UPDATE tasks SET assignee=NULL,status='open',version=version+1 WHERE assignee=? AND status!='done'",
            u.id,
          );
          store.run('DELETE FROM users WHERE id=?', u.id);
        });
        res.setHeader(
          'Set-Cookie',
          `${cookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${prod ? '; Secure' : ''}`,
        );
        json({ ok: true });
        return;
      }
      if (path === '/v1/billing/sync' && method === 'POST') {
        limit('billing:' + u.id, 12, 60000);
        json({ entitlement: await entitlement(u, true) });
        return;
      }
      if (path === '/v1/funnel') {
        if (!config.funnel) fail(503, 'Checkout is not configured.');
        const target = new URL(config.funnel);
        if (target.protocol !== 'https:' || target.hostname !== 'signup.cat')
          fail(503, 'Checkout configuration needs review.');
        target.pathname = target.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(u.id);
        event(u, 'funnel_opened');
        json({ url: target.href });
        return;
      }
      if (path === '/v1/events' && method === 'POST') {
        const b = parse(schemas.event, await body());
        if (!['experiment_exposed', 'paywall_viewed'].includes(b.name))
          fail(400, 'Event not accepted from clients.');
        if (u.analytics)
          store.run(
            'INSERT OR IGNORE INTO events VALUES(?,?,?,?,?,?)',
            b.id,
            u.id,
            app,
            b.name,
            experimentVariant(u.id),
            now(),
          );
        json({ ok: true });
        return;
      }
      if (path === '/v1/reminders' && method === 'GET') {
        json({
          items: store.all(
            'SELECT id,due_at,state FROM reminders WHERE user_id=? ORDER BY due_at DESC LIMIT 100',
            u.id,
          ),
        });
        return;
      }
      if (path === '/v1/reminders' && method === 'POST') {
        if (!u.notifications) fail(403, 'Enable reminders first.');
        if (!config.oneId || !config.oneKey) fail(503, 'Reminders are unavailable.');
        const b = parse(schemas.reminder, await body()),
          due = Date.parse(b.dueAt),
          existing = store.get('SELECT * FROM reminders WHERE id=?', b.id);
        if (existing) {
          if (existing.user_id !== u.id) fail(409, 'Reminder already exists.');
          json({ ok: true, id: b.id });
          return;
        }
        if (due < now() + 60000 || due > now() + 30 * day)
          fail(400, 'Choose a time from one minute to thirty days ahead.');
        if (
          store.get(
            "SELECT COUNT(*) n FROM reminders WHERE user_id=? AND state IN ('pending','sending')",
            u.id,
          ).n >= 20
        )
          fail(400, 'You have twenty active reminders.');
        store.run(
          'INSERT INTO reminders(id,user_id,due_at,next_attempt) VALUES(?,?,?,?)',
          b.id,
          u.id,
          due,
          due,
        );
        json({ id: b.id }, 201);
        return;
      }
      if (path.startsWith('/v1/reminders/') && method === 'DELETE') {
        store.run(
          "UPDATE reminders SET state='cancelled' WHERE id=? AND user_id=? AND state IN ('pending','sending')",
          path.split('/').pop(),
          u.id,
        );
        json({ ok: true });
        return;
      }
      if (path === '/v1/templates' && ['care', 'quote'].includes(app)) {
        if (method === 'GET') {
          json({
            items: store
              .all("SELECT * FROM records WHERE user_id=? AND kind='template'", u.id)
              .map(rec),
          });
          return;
        }
        if (method === 'POST') {
          await requirePro(u);
          json(insert(u, 'template', parse(schemas.template, await body())), 201);
          return;
        }
      }
      if (path.startsWith('/v1/templates/') && method === 'DELETE') {
        const r = own(path.split('/').pop(), u, 'template');
        store.run('DELETE FROM records WHERE id=?', r.id);
        json({ ok: true });
        return;
      }
      if (path.startsWith('/v1/rehearsals')) {
        if (app !== 'rehearsal') fail(404, 'Not found.');
        if (path === '/v1/rehearsals' && method === 'GET') {
          json({
            items: store
              .all(
                "SELECT * FROM records WHERE user_id=? AND kind='rehearsal' ORDER BY created_at DESC LIMIT 200",
                u.id,
              )
              .map(rec),
          });
          return;
        }
        if (path === '/v1/rehearsals' && method === 'POST') {
          const b = parse(schemas.start, await body()),
            s = scenarios.find((x) => x.id === b.scenarioId);
          if (!s) fail(400, 'Choose a scenario.');
          if (s.premium || b.mode === 'ai') await requirePro(u);
          if (b.mode === 'ai' && !u.ai) fail(403, 'Enable AI processing in Settings.');
          json(
            insert(u, 'rehearsal', {
              scenarioId: s.id,
              mode: b.mode,
              before: b.confidence,
              after: null,
              status: 'active',
              messages: [{ role: 'assistant', text: s.opening }],
              feedback: null,
            }),
            201,
          );
          event(u, 'scenario_started');
          return;
        }
        const m = path.match(/^\/v1\/rehearsals\/([\w-]+)(\/(turn|complete))?$/);
        if (m) {
          const r = own(m[1], u, 'rehearsal'),
            d = store.open(r.payload);
          if (method === 'GET' && !m[2]) {
            json(rec(r));
            return;
          }
          if (method === 'DELETE' && !m[2]) {
            store.run('DELETE FROM records WHERE id=?', r.id);
            json({ ok: true });
            return;
          }
          if (method === 'POST' && m[3] === 'turn') {
            const b = parse(schemas.turn, await body());
            if (d.status !== 'active') fail(409, 'This practice is complete.');
            if (b.version !== r.version) fail(409, 'The practice changed. Refresh and try again.');
            if (locks.has(r.id)) fail(409, 'A response is already in progress.');
            locks.add(r.id);
            try {
              limit('turn:' + u.id, 50, day);
              if (d.mode === 'ai') await requirePro(u);
              let messages = d.messages;
              if (b.retryIndex !== undefined) {
                if (messages[b.retryIndex]?.role !== 'user')
                  fail(400, 'Choose one of your responses to retry.');
                messages = messages.slice(0, b.retryIndex);
              }
              if (messages.length >= 41) fail(400, 'Finish this practice and start another.');
              messages = [...messages, { role: 'user', text: b.text }];
              const result =
                d.mode === 'ai'
                  ? await provider.roleplay(
                      u,
                      scenarios.find((s) => s.id === d.scenarioId),
                      messages,
                    )
                  : { reply: guidedReply(b.text), feedback: guidedFeedback(b.text) };
              const updated = {
                ...d,
                messages: [...messages, { role: 'assistant', text: result.reply }],
                feedback: result.feedback,
              };
              if (
                !store.run(
                  'UPDATE records SET payload=?,version=version+1,updated_at=? WHERE id=? AND user_id=? AND version=?',
                  store.seal(updated),
                  now(),
                  r.id,
                  u.id,
                  r.version,
                ).changes
              )
                fail(409, 'The practice changed. Refresh and try again.');
              if (b.retryIndex !== undefined) event(u, 'moment_retried');
              json(rec(store.get('SELECT * FROM records WHERE id=?', r.id)));
            } finally {
              locks.delete(r.id);
            }
            return;
          }
          if (method === 'POST' && m[3] === 'complete') {
            const b = parse(schemas.complete, await body());
            if (locks.has(r.id)) fail(409, 'Wait for the current response.');
            if (d.messages.length < 3) fail(400, 'Try at least one response first.');
            if (d.status !== 'complete') {
              store.run(
                'UPDATE records SET payload=?,version=version+1,updated_at=? WHERE id=?',
                store.seal({ ...d, status: 'complete', after: b.confidence }),
                now(),
                r.id,
              );
              event(u, 'rehearsal_completed');
            }
            json(rec(store.get('SELECT * FROM records WHERE id=?', r.id)));
            return;
          }
        }
      }
      if (path === '/v1/audio/transcribe' && method === 'POST' && app === 'rehearsal') {
        if (!u.ai) fail(403, 'Enable AI processing first.');
        await requirePro(u);
        limit('audio:' + u.id, 15, day);
        const mime = String(req.headers['content-type']).split(';')[0];
        if (!['audio/mp4', 'audio/m4a', 'audio/webm', 'audio/wav', 'audio/mpeg'].includes(mime))
          fail(415, 'Unsupported recording format.');
        json({ text: await provider.transcribe(u, await raw(8 * 1024 * 1024), mime) });
        return;
      }
      if (path.startsWith('/v1/circles')) {
        if (app !== 'care') fail(404, 'Not found.');
        if (path === '/v1/circles' && method === 'GET') {
          json({
            items: store
              .all(
                'SELECT c.* FROM circles c JOIN members m ON m.circle_id=c.id WHERE m.user_id=?',
                u.id,
              )
              .map((c) => ({ id: c.id, owner: c.owner, ...store.open(c.payload) })),
          });
          return;
        }
        if (path === '/v1/circles' && method === 'POST') {
          const b = parse(schemas.name, await body());
          if (store.get('SELECT COUNT(*) n FROM circles WHERE owner=?', u.id).n >= 1)
            await requirePro(u);
          const id = randomUUID();
          store.transaction(() => {
            store.run('INSERT INTO circles VALUES(?,?,?)', id, u.id, store.seal(b));
            store.run('INSERT INTO members VALUES(?,?)', id, u.id);
          });
          event(u, 'circle_created');
          json({ id, ...b }, 201);
          return;
        }
        if (path === '/v1/circles/join' && method === 'POST') {
          const b = parse(schemas.invite, await body()),
            invite = store.get(
              'SELECT * FROM invites WHERE hash=? AND expires_at>?',
              hash(b.code),
              now(),
            );
          if (!invite) fail(404, 'Invitation expired or already used.');
          if (
            store.get('SELECT COUNT(*) n FROM members WHERE circle_id=?', invite.circle_id).n >= 30
          )
            fail(400, 'This circle is full.');
          store.transaction(() => {
            store.run('INSERT OR IGNORE INTO members VALUES(?,?)', invite.circle_id, u.id);
            store.run('DELETE FROM invites WHERE hash=?', hash(b.code));
          });
          json({ id: invite.circle_id });
          return;
        }
        const m = path.match(/^\/v1\/circles\/([\w-]+)(\/(invite|leave|tasks)(?:\/([\w-]+))?)?$/);
        if (m) {
          const c = member(m[1], u);
          if (!m[2] && method === 'GET') {
            json({
              id: c.id,
              owner: c.owner,
              ...store.open(c.payload),
              members: store
                .all(
                  'SELECT u.id,u.profile FROM users u JOIN members m ON m.user_id=u.id WHERE m.circle_id=?',
                  c.id,
                )
                .map((x) => ({ id: x.id, name: store.open(x.profile).name })),
              tasks: store
                .all('SELECT * FROM tasks WHERE circle_id=? ORDER BY updated_at DESC', c.id)
                .map(task),
            });
            return;
          }
          if (!m[2] && method === 'DELETE') {
            if (c.owner !== u.id) fail(403, 'Only the owner can delete a circle.');
            store.run('DELETE FROM circles WHERE id=?', c.id);
            json({ ok: true });
            return;
          }
          if (m[3] === 'leave' && method === 'POST') {
            if (c.owner === u.id) fail(409, 'Owners must delete the circle instead.');
            store.transaction(() => {
              store.run('DELETE FROM members WHERE circle_id=? AND user_id=?', c.id, u.id);
              store.run(
                "UPDATE tasks SET assignee=NULL,status='open',version=version+1 WHERE circle_id=? AND assignee=? AND status!='done'",
                c.id,
                u.id,
              );
            });
            json({ ok: true });
            return;
          }
          if (m[3] === 'invite' && method === 'POST') {
            if (c.owner !== u.id) fail(403, 'Ask the owner to invite someone.');
            limit('invite:' + u.id, 20, day);
            const code = token();
            store.run('INSERT INTO invites VALUES(?,?,?)', hash(code), c.id, now() + 2 * day);
            json({ code, expiresAt: now() + 2 * day });
            return;
          }
          if (m[3] === 'tasks' && !m[4] && method === 'POST') {
            const b = parse(schemas.task, await body()),
              id = randomUUID();
            store.run(
              'INSERT INTO tasks(id,circle_id,payload,updated_at) VALUES(?,?,?,?)',
              id,
              c.id,
              store.seal(b),
              now(),
            );
            json(task(store.get('SELECT * FROM tasks WHERE id=?', id)), 201);
            return;
          }
          if (m[3] === 'tasks' && m[4] && method === 'POST') {
            const b = parse(schemas.transition, await body()),
              r = store.get('SELECT * FROM tasks WHERE id=? AND circle_id=?', m[4], c.id);
            if (!r) fail(404, 'Task not found.');
            if (
              b.target &&
              !store.get('SELECT 1 FROM members WHERE user_id=? AND circle_id=?', b.target, c.id)
            )
              fail(400, 'Choose a circle member.');
            let next;
            try {
              next = taskTransition(r, u.id, b.action, b.target);
            } catch (e) {
              fail(409, e.message);
            }
            if (
              !store.run(
                'UPDATE tasks SET status=?,assignee=?,version=version+1,updated_at=? WHERE id=? AND version=?',
                next.status,
                next.assignee,
                now(),
                r.id,
                b.version,
              ).changes
            )
              fail(409, 'This task changed. Refresh before trying again.');
            if (next.status === 'done') event(u, 'task_completed');
            json(task(store.get('SELECT * FROM tasks WHERE id=?', r.id)));
            return;
          }
        }
      }
      if (path.startsWith('/v1/meals')) {
        if (app !== 'meal') fail(404, 'Not found.');
        if (path === '/v1/meals/suggest' && method === 'POST') {
          const b = parse(schemas.meal, await body());
          json({ items: mealPatches(b) });
          return;
        }
        if (path === '/v1/meals' && method === 'GET') {
          json({
            items: store
              .all(
                "SELECT * FROM records WHERE user_id=? AND kind='meal' ORDER BY created_at DESC",
                u.id,
              )
              .map(rec),
          });
          return;
        }
        if (path === '/v1/meals' && method === 'POST') {
          const b = await body(),
            input = parse(schemas.meal, b.input);
          if (
            !Array.isArray(b.selected) ||
            !b.selected.length ||
            b.selected.length > 3 ||
            b.selected.some((x) => typeof x !== 'string')
          )
            fail(400, 'Select one to three suggestions.');
          const options = mealPatches(input),
            selected = options.filter((x) => b.selected.includes(x.id));
          if (selected.length !== new Set(b.selected).size)
            fail(400, 'Your selections do not match your constraints.');
          if (
            store.get("SELECT COUNT(*) n FROM records WHERE user_id=? AND kind='meal'", u.id).n >=
            10
          )
            await requirePro(u);
          json(insert(u, 'meal', { input, selected, plannedDate: null }), 201);
          event(u, 'meal_saved');
          return;
        }
        const m = path.match(/^\/v1\/meals\/([\w-]+)(\/plan)?$/);
        if (m) {
          const r = own(m[1], u, 'meal');
          if (method === 'DELETE' && !m[2]) {
            store.run('DELETE FROM records WHERE id=?', r.id);
            json({ ok: true });
            return;
          }
          if (method === 'PUT' && m[2]) {
            const b = await body();
            if (b.date !== null) {
              if (typeof b.date !== 'string' || !validDate(b.date))
                fail(400, 'Use a valid YYYY-MM-DD date.');
              await requirePro(u);
            }
            store.run(
              'UPDATE records SET payload=?,version=version+1,updated_at=? WHERE id=?',
              store.seal({ ...store.open(r.payload), plannedDate: b.date }),
              now(),
              r.id,
            );
            json({ ok: true });
            return;
          }
        }
      }
      if (path.startsWith('/v1/quotes')) {
        if (app !== 'quote') fail(404, 'Not found.');
        if (path === '/v1/quotes' && method === 'GET') {
          json({
            items: store
              .all('SELECT * FROM quotes WHERE user_id=? ORDER BY created_at DESC', u.id)
              .map(quote),
          });
          return;
        }
        if (path === '/v1/quotes' && method === 'POST') {
          const b = parse(schemas.quote, await body());
          if (
            !validDate(b.validUntil) ||
            Date.parse(b.validUntil + 'T23:59:59Z') < now() ||
            Date.parse(b.validUntil) > now() + 366 * day
          )
            fail(400, 'Choose an expiry within the next year.');
          const d = new Date(now()),
            month = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
          if (
            store.get(
              'SELECT COUNT(*) n FROM quotes WHERE user_id=? AND created_at>=?',
              u.id,
              month,
            ).n >= 3
          )
            await requirePro(u);
          let totals;
          try {
            totals = quoteTotals(b.items, b.taxBps, b.depositPercent);
          } catch (e) {
            fail(400, e.message);
          }
          const id = randomUUID();
          store.run(
            'INSERT INTO quotes(id,user_id,payload,created_at) VALUES(?,?,?,?)',
            id,
            u.id,
            store.seal({ ...b, ...totals }),
            now(),
          );
          event(u, 'quote_created');
          json(quote(store.get('SELECT * FROM quotes WHERE id=?', id)), 201);
          return;
        }
        const m = path.match(/^\/v1\/quotes\/([\w-]+)(\/(share|revoke))?$/);
        if (m) {
          const r = store.get('SELECT * FROM quotes WHERE id=? AND user_id=?', m[1], u.id);
          if (!r) fail(404, 'Quote not found.');
          if (method === 'DELETE' && !m[2]) {
            store.run('DELETE FROM quotes WHERE id=?', r.id);
            json({ ok: true });
            return;
          }
          if (method === 'POST' && m[3] === 'share') {
            if (r.status === 'accepted') fail(409, 'An accepted quote cannot be changed.');
            const code = token();
            store.run("UPDATE quotes SET share_hash=?,status='sent' WHERE id=?", hash(code), r.id);
            json({ url: origin + '/quote/' + code, token: code });
            return;
          }
          if (method === 'POST' && m[3] === 'revoke') {
            store.run(
              "UPDATE quotes SET share_hash=NULL,status=CASE WHEN status='accepted' THEN status ELSE 'draft' END WHERE id=?",
              r.id,
            );
            json({ ok: true });
            return;
          }
        }
      }
      fail(404, 'Not found.');
    } catch (e) {
      if (!res.headersSent)
        json(
          {
            error: e.status ? e.message : 'The service could not complete this request.',
            requestId,
          },
          e.status || 500,
        );
      else res.end();
      if (!e.status) console.error(JSON.stringify({ requestId, error: e.name || 'Error' }));
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  return {
    server,
    store,
    provider,
    tick: () => tick(store, provider, now()),
    close: () =>
      new Promise((resolve) =>
        server.close(() => {
          store.close();
          resolve();
        }),
      ),
  };
}

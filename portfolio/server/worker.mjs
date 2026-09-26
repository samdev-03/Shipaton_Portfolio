export async function tick(store, providers, now = Date.now()) {
  store.run("UPDATE reminders SET state='pending' WHERE state='sending' AND next_attempt<?", now);
  for (const row of store.all(
    "SELECT * FROM reminders WHERE state='pending' AND next_attempt<=? LIMIT 20",
    now,
  )) {
    const user = store.get('SELECT * FROM users WHERE id=?', row.user_id);
    if (!user?.notifications) {
      store.run("UPDATE reminders SET state='cancelled' WHERE id=?", row.id);
      continue;
    }
    if (
      !store.run(
        "UPDATE reminders SET state='sending',next_attempt=? WHERE id=? AND state='pending'",
        now + 60000,
        row.id,
      ).changes
    )
      continue;
    try {
      const result = await providers.notify(user, row);
      if (!result.id) throw Error('No recipient');
      store.run(
        "UPDATE reminders SET state='sent',provider_id=? WHERE id=? AND state='sending'",
        String(result.id),
        row.id,
      );
    } catch {
      const n = row.attempts + 1;
      store.run(
        "UPDATE reminders SET state=?,attempts=?,next_attempt=? WHERE id=? AND state='sending'",
        n >= 6 ? 'failed' : 'pending',
        n,
        now + Math.min(3600000, 30000 * 2 ** n),
        row.id,
      );
    }
  }
  for (const j of store.all(
    "SELECT * FROM deletion_jobs WHERE state='pending' AND next_attempt<=? LIMIT 10",
    now,
  ))
    try {
      await providers.deleteUser(j.app, j.user_id, j.provider);
      store.run('DELETE FROM deletion_jobs WHERE id=?', j.id);
    } catch {
      store.run(
        'UPDATE deletion_jobs SET attempts=attempts+1,next_attempt=? WHERE id=?',
        now + Math.min(86400000, 60000 * 2 ** Math.min(j.attempts, 10)),
        j.id,
      );
    }
  for (const table of ['sessions', 'limits', 'invites'])
    store.run(`DELETE FROM ${table} WHERE expires_at<?`, now);
  store.run('DELETE FROM events WHERE created_at<?', now - 90 * 86400000);
}

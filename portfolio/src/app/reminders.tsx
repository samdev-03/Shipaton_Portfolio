import React, { useCallback, useEffect, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { Gate } from '../components/Gate';
import { Screen, Stack, T, Card, Button, Field, Notice, Pill, useAction } from '../components/ui';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
import { enablePush, updateConsent } from '../lib/sdk';
export default function Reminders() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const { user, setPreferences, config } = useSession(),
    [items, setItems] = useState<any[]>([]),
    [message, setMessage] = useState(''),
    [when, setWhen] = useState(() => {
      const d = new Date(Date.now() + 3600000);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }),
    a = useAction(),
    { run } = a;
  const load = useCallback(async () => setItems((await api('/v1/reminders')).items), []);
  useEffect(() => {
    void run(load);
  }, [run, load]);
  return (
    <Screen back title="A nudge, on your terms">
      <Stack>
        <T kind="hero">Make a little room in your day.</T>
        <T>
          You choose the time. Personal task and conversation details stay off your lock screen.
        </T>
        {a.error ? <Notice error message={a.error} /> : null}
        {message ? <Notice message={message} /> : null}
        {!user?.preferences.notifications ? (
          <Button
            title="Enable my reminders"
            busy={a.busy}
            onPress={() =>
              a.run(async () => {
                if (!config.pushAvailable) throw Error('Reminders are unavailable right now.');
                if (!(await enablePush()))
                  throw Error(
                    'Notification permission was not granted. You can change it in device settings.',
                  );
                await setPreferences({ ...user!.preferences, notifications: true });
                await updateConsent(user!.preferences.analytics, true, user!.id);
                setMessage('Reminders enabled.');
              })
            }
          />
        ) : null}
        <Card>
          <Stack>
            <Field
              label="Local date and time · YYYY-MM-DDTHH:mm"
              value={when}
              onChangeText={setWhen}
            />
            <T kind="caption">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. Schedule from one minute
              to thirty days ahead.
            </T>
            <Button
              title="Set my reminder"
              disabled={!user?.preferences.notifications}
              busy={a.busy}
              onPress={() =>
                a.run(async () => {
                  const d = new Date(when);
                  if (!Number.isFinite(d.getTime()))
                    throw Error('Enter a valid local date and time.');
                  await api('/v1/reminders', 'POST', { id: randomUUID(), dueAt: d.toISOString() });
                  setMessage('Reminder scheduled.');
                  await load();
                })
              }
            />
          </Stack>
        </Card>
        {items.map((i) => (
          <Card key={i.id}>
            <Stack>
              <T>{new Date(i.due_at).toLocaleString()}</T>
              <Pill>{i.state}</Pill>
              {['pending', 'sending'].includes(i.state) ? (
                <Button
                  quiet
                  title="Cancel reminder"
                  onPress={() =>
                    a.run(async () => {
                      await api('/v1/reminders/' + i.id, 'DELETE');
                      await load();
                    })
                  }
                />
              ) : null}
              {i.state === 'failed' ? (
                <T kind="caption">
                  Delivery could not be completed. Check device permissions and schedule another
                  reminder.
                </T>
              ) : null}
            </Stack>
          </Card>
        ))}
      </Stack>
    </Screen>
  );
}

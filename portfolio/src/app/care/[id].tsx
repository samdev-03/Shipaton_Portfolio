import React, { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Gate } from '../../components/Gate';
import {
  Screen,
  Stack,
  T,
  Card,
  Button,
  Field,
  Notice,
  Row,
  Pill,
  useAction,
} from '../../components/ui';
import { api } from '../../lib/api';
import { useSession } from '../../lib/session';
import { trackSdk } from '../../lib/sdk';
export default function Circle() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    [circle, setCircle] = useState<any>(null),
    [title, setTitle] = useState(''),
    [note, setNote] = useState(''),
    [message, setMessage] = useState(''),
    [confirmDelete, setConfirmDelete] = useState(false),
    [adding, setAdding] = useState(false),
    a = useAction(),
    { run } = a,
    { user, entitlement } = useSession();
  const load = useCallback(async () => setCircle(await api('/v1/circles/' + id)), [id]);
  useEffect(() => {
    void run(load);
  }, [run, load]);
  const transition = (t: any, action: string, target?: string) =>
    a.run(async () => {
      await api(`/v1/circles/${id}/tasks/${t.id}`, 'POST', {
        action,
        version: t.version,
        ...(target ? { target } : {}),
      });
      if (action === 'complete') trackSdk('task_completed');
      await load();
    });
  return (
    <Screen back title={circle?.name || 'Your circle'}>
      <Stack>
        {a.error ? <Notice error message={a.error} /> : null}
        {message ? <Notice message={message} /> : null}
        {circle ? (
          <>
            <T kind="hero">One next step. Together.</T>
            <T>{circle.members.map((m: any) => m.name).join(' · ')}</T>
            <Button quiet title="Refresh shared tasks" busy={a.busy} onPress={() => a.run(load)} />
            {circle.owner === user?.id ? (
              <Button
                quiet
                title="Create invitation code"
                onPress={() =>
                  a.run(async () => {
                    const r = await api(`/v1/circles/${id}/invite`, 'POST', {});
                    await Clipboard.setStringAsync(r.code);
                    setMessage(
                      'Single-use invitation copied. Share it privately; it expires in 48 hours.',
                    );
                  })
                }
              />
            ) : null}
            {circle.tasks.length ? (
              <Button
                quiet
                title={adding ? 'Close task form' : 'Add another task'}
                onPress={() => setAdding(!adding)}
              />
            ) : null}
            {!circle.tasks.length || adding ? (
              <Card>
                <Stack>
                  <T kind="title">What would help?</T>
                  <Field label="Task" value={title} onChangeText={setTitle} />
                  <Field
                    label="Helpful details (optional)"
                    value={note}
                    onChangeText={setNote}
                    multiline
                  />
                  <Button
                    title="Add task"
                    disabled={!title.trim()}
                    busy={a.busy}
                    onPress={() =>
                      a.run(async () => {
                        await api(`/v1/circles/${id}/tasks`, 'POST', { title, note });
                        setAdding(false);
                        setTitle('');
                        setNote('');
                        await load();
                      })
                    }
                  />
                  {entitlement?.active ? (
                    <Button
                      quiet
                      title="Save as a reusable template"
                      disabled={!title.trim()}
                      onPress={() =>
                        a.run(async () => {
                          await api('/v1/templates', 'POST', {
                            name: title,
                            content: note || title,
                          });
                          setMessage('Template saved in Your progress.');
                        })
                      }
                    />
                  ) : null}
                </Stack>
              </Card>
            ) : null}
            <T kind="title">The shared list</T>
            {!circle.tasks.length ? (
              <T>Add a small task so your circle can see where help is needed.</T>
            ) : (
              circle.tasks.map((t: any) => (
                <Card key={t.id}>
                  <Stack>
                    <Pill active={t.status === 'done'}>
                      {t.status === 'open'
                        ? 'Ready to pick up'
                        : t.status === 'claimed'
                          ? 'Waiting for acknowledgment'
                          : t.status === 'acknowledged'
                            ? 'In good hands'
                            : 'Complete'}
                    </Pill>
                    <T kind="title">{t.title}</T>
                    {t.note ? <T>{t.note}</T> : null}
                    <T kind="caption">
                      {t.assignee
                        ? 'With ' +
                          (circle.members.find((m: any) => m.id === t.assignee)?.name ||
                            'a circle member')
                        : 'No one assigned yet'}
                    </T>
                    {t.status === 'open' ? (
                      <Button
                        title="I can help"
                        busy={a.busy}
                        onPress={() => transition(t, 'claim')}
                      />
                    ) : null}
                    {t.assignee === user?.id && t.status === 'claimed' ? (
                      <Button
                        title="I’ve seen this and accept it"
                        busy={a.busy}
                        onPress={() => transition(t, 'acknowledge')}
                      />
                    ) : null}
                    {t.assignee === user?.id && t.status === 'acknowledged' ? (
                      <>
                        <Button
                          title="Mark complete"
                          busy={a.busy}
                          onPress={() => transition(t, 'complete')}
                        />
                        <T kind="caption">
                          Hand off to someone in your circle. They will need to acknowledge it.
                        </T>
                        <Row style={{ flexWrap: 'wrap' }}>
                          {circle.members
                            .filter((m: any) => m.id !== user?.id)
                            .map((m: any) => (
                              <Pill key={m.id} onPress={() => transition(t, 'handoff', m.id)}>
                                {m.name}
                              </Pill>
                            ))}
                        </Row>
                      </>
                    ) : null}
                    {t.assignee === user?.id && t.status !== 'done' ? (
                      <Button
                        quiet
                        title="Release this task"
                        onPress={() => transition(t, 'release')}
                      />
                    ) : null}
                  </Stack>
                </Card>
              ))
            )}
            <Button
              quiet
              title={circle.owner === user?.id ? 'Delete this circle…' : 'Leave this circle…'}
              onPress={() => setConfirmDelete(!confirmDelete)}
            />
            {confirmDelete ? (
              <Card>
                <Stack>
                  <Notice
                    error
                    message={
                      circle.owner === user?.id
                        ? 'Deleting this circle permanently removes its tasks for every member.'
                        : 'Your unfinished tasks will become available for another person to claim.'
                    }
                  />
                  <Button
                    danger
                    title="Confirm"
                    busy={a.busy}
                    onPress={() =>
                      a.run(async () => {
                        await api(
                          `/v1/circles/${id}` + (circle.owner === user?.id ? '' : '/leave'),
                          circle.owner === user?.id ? 'DELETE' : 'POST',
                          circle.owner === user?.id ? undefined : {},
                        );
                        router.replace('/');
                      })
                    }
                  />
                  <Button quiet title="Keep my place" onPress={() => setConfirmDelete(false)} />
                </Stack>
              </Card>
            ) : null}
          </>
        ) : (
          <T>Loading your circle…</T>
        )}
      </Stack>
    </Screen>
  );
}

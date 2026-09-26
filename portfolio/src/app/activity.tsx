import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Gate } from '../components/Gate';
import {
  Screen,
  Stack,
  T,
  Card,
  Button,
  Field,
  Notice,
  Pill,
  Tabs,
  useAction,
} from '../components/ui';
import { api } from '../lib/api';
import { appId } from '../lib/config';
import { useSession } from '../lib/session';
import { scenarios } from '../../shared/catalog';
export default function Activity() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const [items, setItems] = useState<any[]>([]),
    [message, setMessage] = useState(''),
    a = useAction(),
    { run } = a,
    { entitlement } = useSession(),
    path =
      appId === 'rehearsal' ? '/v1/rehearsals' : appId === 'meal' ? '/v1/meals' : '/v1/templates';
  const load = useCallback(async () => setItems((await api(path)).items), [path]);
  useFocusEffect(
    useCallback(() => {
      void run(load);
    }, [run, load]),
  );
  const completed = items.filter((i) => i.status === 'complete').length,
    shopping =
      appId === 'meal'
        ? [
            ...new Set(
              items
                .filter((i) => i.plannedDate)
                .flatMap((i) => i.selected.flatMap((p: any) => p.ingredients)),
            ),
          ]
        : [];
  return (
    <Screen title="Your progress" footer={<Tabs active="activity" />}>
      <Stack>
        <T kind="hero">Small steps add up.</T>
        {appId === 'rehearsal' ? (
          <T>
            {completed} completed {completed === 1 ? 'practice' : 'practices'}
          </T>
        ) : (
          <T>
            {appId === 'meal'
              ? 'Saved meals and your weekly plan.'
              : 'Your reusable templates, ready when you need them.'}
          </T>
        )}
        {a.error ? <Notice error message={a.error} /> : null}
        {message ? <Notice message={message} /> : null}
        {!items.length ? (
          <Card>
            <T>
              {appId === 'rehearsal'
                ? 'Your saved practice will appear here.'
                : appId === 'meal'
                  ? 'Save a meal to give your next week a head start.'
                  : 'Create reusable templates from your tasks or quote scope with Pro.'}
            </T>
          </Card>
        ) : null}
        {items.map((item) => (
          <Card key={item.id}>
            <Stack>
              {appId === 'rehearsal' ? (
                <>
                  <Pill>{item.status}</Pill>
                  <T kind="title">{scenarios.find((s) => s.id === item.scenarioId)?.title}</T>
                  <T>
                    Readiness before: {item.before}/5
                    {item.after ? ' · after: ' + item.after + '/5' : ''}
                  </T>
                  <T kind="caption">Your own reflection, not a measured career outcome.</T>
                  <Button
                    title="Open practice"
                    onPress={() => router.push(`/practice/${item.id}` as any)}
                  />
                </>
              ) : appId === 'meal' ? (
                <>
                  <T kind="title">{item.input.name}</T>
                  {item.selected.map((p: any) => (
                    <Stack key={p.id} gap={6}>
                      <T>{p.title}</T>
                      <T kind="caption">{p.steps}</T>
                    </Stack>
                  ))}
                  <MealPlanner item={item} pro={!!entitlement?.active} saved={load} />
                </>
              ) : (
                <>
                  <T kind="title">{item.name}</T>
                  <T>{item.content}</T>
                  <Button
                    quiet
                    title="Copy template"
                    onPress={() =>
                      a.run(async () => {
                        await Clipboard.setStringAsync(item.content);
                        setMessage('Template copied. Paste it into your next task or quote.');
                      })
                    }
                  />
                </>
              )}
              <DeleteItem
                onDelete={() =>
                  a.run(async () => {
                    await api(path + '/' + item.id, 'DELETE');
                    await load();
                  })
                }
              />
            </Stack>
          </Card>
        ))}
        {shopping.length ? (
          <Card>
            <Stack>
              <T kind="title">Your shopping list</T>
              {shopping.map((x) => (
                <T key={String(x)}>• {String(x)}</T>
              ))}
              <T kind="caption">
                Ingredients across planned meals. Check quantities you need and what you already
                have.
              </T>
              <Button
                quiet
                title="Copy shopping list"
                onPress={() => void Clipboard.setStringAsync(shopping.join('\n'))}
              />
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </Screen>
  );
}
function DeleteItem({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <Stack>
      <T>Delete this saved item permanently?</T>
      <Button danger title="Yes, delete this item" onPress={onDelete} />
      <Button quiet title="Keep this item" onPress={() => setConfirm(false)} />
    </Stack>
  ) : (
    <Button quiet title="Delete saved item…" onPress={() => setConfirm(true)} />
  );
}
function MealPlanner({
  item,
  pro,
  saved,
}: {
  item: any;
  pro: boolean;
  saved: () => Promise<void>;
}) {
  const [date, setDate] = useState(item.plannedDate || new Date().toISOString().slice(0, 10)),
    a = useAction();
  return (
    <Stack>
      {item.plannedDate ? <Pill>Planned for {item.plannedDate}</Pill> : null}
      {pro ? (
        <>
          <Field label="Plan date · YYYY-MM-DD" value={date} onChangeText={setDate} />
          <Button
            quiet
            title="Add to my plan"
            busy={a.busy}
            onPress={() =>
              a.run(async () => {
                await api(`/v1/meals/${item.id}/plan`, 'PUT', { date });
                await saved();
              })
            }
          />
        </>
      ) : (
        <Button quiet title="Explore Pro planning" onPress={() => router.push('/pro')} />
      )}{' '}
      {item.plannedDate ? (
        <Button
          quiet
          title="Remove from plan"
          onPress={() =>
            a.run(async () => {
              await api(`/v1/meals/${item.id}/plan`, 'PUT', { date: null });
              await saved();
            })
          }
        />
      ) : null}
      {a.error ? <Notice error message={a.error} /> : null}
    </Stack>
  );
}

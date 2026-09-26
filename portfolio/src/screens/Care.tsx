import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
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
  palette,
} from '../components/ui';
import { api } from '../lib/api';
import { brand } from '../lib/config';
import { useFirstStepExperiment } from '../lib/experiment';
import { trackSdk } from '../lib/sdk';
export default function Care() {
  const variant = useFirstStepExperiment(),
    [circles, setCircles] = useState<any[]>([]),
    [name, setName] = useState(''),
    [code, setCode] = useState(''),
    a = useAction(),
    { run } = a;
  useFocusEffect(
    useCallback(() => {
      void run(async () => setCircles((await api('/v1/circles')).items));
    }, [run]),
  );
  return (
    <Screen footer={<Tabs />}>
      <Stack>
        <Pill>SMALL TASKS. SHARED CARE.</Pill>
        <T kind="hero">You don’t have to carry it all.</T>
        <T style={{ color: palette.muted }}>
          Make one next step visible. Someone can pick it up from there.
        </T>
        <Card style={{ backgroundColor: brand.color }}>
          <Stack>
            <T kind="label">YOUR CIRCLES</T>
            {circles.length ? (
              circles.map((c) => (
                <Button
                  key={c.id}
                  title={c.name + ' →'}
                  onPress={() => router.push(`/care/${c.id}` as any)}
                />
              ))
            ) : (
              <T kind="title">Start with the people you trust.</T>
            )}
            <T kind="caption">Tasks are visible only to people in your circle.</T>
          </Stack>
        </Card>
        {a.error ? <Notice error message={a.error} /> : null}
        <Card>
          <Stack>
            <T kind="title">Create a care circle</T>
            <Field
              label="Circle name"
              value={name}
              onChangeText={setName}
              placeholder="For example, Sunday support"
            />
            <Button
              title={variant === 'B' ? 'Start my circle' : 'Create circle'}
              busy={a.busy}
              disabled={!name.trim()}
              onPress={() =>
                a.run(async () => {
                  const c = await api('/v1/circles', 'POST', { name });
                  trackSdk('circle_created');
                  router.push(`/care/${c.id}` as any);
                })
              }
            />
            <T kind="caption">Your first circle and its everyday tasks are free.</T>
          </Stack>
        </Card>
        <Card>
          <Stack>
            <T kind="title">Someone saved you a place?</T>
            <Field
              label="Invitation code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
            />
            <Button
              quiet
              title="Join a circle"
              disabled={!code}
              busy={a.busy}
              onPress={() =>
                a.run(async () => {
                  const c = await api('/v1/circles/join', 'POST', { code });
                  router.push(`/care/${c.id}` as any);
                })
              }
            />
          </Stack>
        </Card>
        <T kind="caption">
          Care Relay coordinates everyday tasks. It is not an emergency or clinical service.
        </T>
      </Stack>
    </Screen>
  );
}

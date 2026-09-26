import React, { useState } from 'react';
import { Switch } from 'react-native';
import { router } from 'expo-router';
import { Gate } from '../components/Gate';
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
  Tabs,
  useAction,
} from '../components/ui';
import { api, saveSession } from '../lib/api';
import { useSession } from '../lib/session';
import { appId } from '../lib/config';
import { disconnectSdk } from '../lib/sdk';
import { exportJson } from '../lib/export';
export default function Settings() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const s = useSession(),
    { user, entitlement } = s,
    [deleting, setDeleting] = useState(false),
    [password, setPassword] = useState(''),
    [message, setMessage] = useState(''),
    a = useAction();
  if (!user) return null;
  const toggle = (key: 'analytics' | 'ai') =>
    a.run(async () => {
      await s.setPreferences({ ...user.preferences, [key]: !user.preferences[key] });
      setMessage('Your preference has been saved.');
    });
  return (
    <Screen title="Your settings" footer={<Tabs active="settings" />}>
      <Stack>
        <T kind="hero">Your space. Your choices.</T>
        <Card>
          <Stack>
            <T kind="title">{user.name}</T>
            <T>{user.email}</T>
            <Pill>{entitlement?.active ? 'Pro active' : 'Free account'}</Pill>
            <Button title="Explore Pro" onPress={() => router.push('/pro')} />
          </Stack>
        </Card>
        {a.error ? <Notice error message={a.error} /> : null}
        {message ? <Notice message={message} /> : null}
        {s.connectionError ? <Notice error message={s.connectionError} /> : null}
        <Card>
          <Stack>
            <T kind="title">Privacy preferences</T>
            <Row>
              <Stack style={{ flex: 1 }}>
                <T>Optional usage analytics</T>
                <T kind="caption">
                  Event counts help improve the app. Private content is excluded.
                </T>
              </Stack>
              <Switch
                accessibilityLabel="Optional usage analytics"
                disabled={a.busy}
                value={user.preferences.analytics}
                onValueChange={() => toggle('analytics')}
              />
            </Row>
            {appId === 'rehearsal' ? (
              <Row>
                <Stack style={{ flex: 1 }}>
                  <T>Optional AI processing</T>
                  <T kind="caption">
                    Send selected practice text and recordings to OpenAI for AI roleplay or
                    transcription. Available to adults 18 and older. Guided practice works without
                    it.
                  </T>
                </Stack>
                <Switch
                  accessibilityLabel="Optional AI processing"
                  disabled={a.busy || !user.aiEligible}
                  value={user.preferences.ai}
                  onValueChange={() => toggle('ai')}
                />
              </Row>
            ) : null}
            <Button quiet title="My reminders" onPress={() => router.push('/reminders')} />
            {user.preferences.notifications ? (
              <Button
                quiet
                title="Turn off reminders"
                onPress={() =>
                  a.run(async () => {
                    await s.setPreferences({ ...user.preferences, notifications: false });
                    setMessage('Reminders disabled. Pending reminders cancelled.');
                  })
                }
              />
            ) : null}
          </Stack>
        </Card>
        <Card>
          <Stack>
            <T kind="title">Your data</T>
            <Button
              quiet
              title="Export my data"
              busy={a.busy}
              onPress={() =>
                a.run(async () => {
                  await exportJson(await api('/v1/export'));
                  setMessage('Export ready.');
                })
              }
            />
            <Button quiet title="Delete my account…" onPress={() => setDeleting(!deleting)} />
            {deleting ? (
              <Stack>
                <Notice
                  error
                  message="This permanently deletes your account and saved content. Circles you own are deleted for all members. Cancel store subscriptions separately."
                />
                <Field
                  label="Confirm your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Button
                  danger
                  title="Permanently delete my account"
                  disabled={!password}
                  busy={a.busy}
                  onPress={() =>
                    a.run(async () => {
                      await api('/v1/account', 'DELETE', { password });
                      await saveSession(null);
                      try {
                        await disconnectSdk();
                      } finally {
                        await s.refresh();
                        router.replace('/');
                      }
                    })
                  }
                />
                <Button quiet title="Keep my account" onPress={() => setDeleting(false)} />
              </Stack>
            ) : null}
          </Stack>
        </Card>
        <Row style={{ flexWrap: 'wrap' }}>
          <Button
            quiet
            title="Privacy policy"
            onPress={() => router.push('/legal?document=privacy')}
          />
          <Button quiet title="Terms" onPress={() => router.push('/legal?document=terms')} />
          <Button quiet title="Support" onPress={() => router.push('/legal?document=support')} />
        </Row>
        <Button
          quiet
          title="Sign out"
          busy={a.busy}
          onPress={() =>
            a.run(async () => {
              await s.logout();
              router.replace('/');
            })
          }
        />
        <T kind="caption">Version 1.0.0</T>
      </Stack>
    </Screen>
  );
}

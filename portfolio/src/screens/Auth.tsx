import React, { useState } from 'react';
import { Switch } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  Stack,
  T,
  Field,
  Button,
  Notice,
  Row,
  Card,
  Pill,
  useAction,
  palette,
} from '../components/ui';
import { brand } from '../lib/config';
import { useSession } from '../lib/session';
export default function Auth() {
  const [kind, setKind] = useState('register'),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [code, setCode] = useState(''),
    [accepted, setAccepted] = useState(false),
    action = useAction(),
    session = useSession();
  return (
    <Screen>
      <Stack>
        <Pill>YOUR NEXT STEP, WITH A LITTLE SUPPORT</Pill>
        <T kind="hero">{brand.tagline}</T>
        <T style={{ color: palette.muted }}>
          A quiet place to make everyday things a little easier.
        </T>
        <Card>
          <Stack>
            <T kind="title">
              {kind === 'register'
                ? 'Make yourself at home.'
                : kind === 'recover'
                  ? 'Let’s get you back in.'
                  : 'Welcome back.'}
            </T>
            {kind === 'register' ? (
              <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" />
            ) : null}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {kind === 'recover' ? (
              <Field
                label="Recovery code"
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
              />
            ) : null}
            <Field
              label={kind === 'recover' ? 'New password' : 'Password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={kind === 'login' ? 'current-password' : 'new-password'}
            />
            {kind !== 'login' ? (
              <T kind="caption">
                Use at least 12 characters. Your recovery code will be shown once.
              </T>
            ) : null}
            {kind === 'register' ? (
              <Row>
                <Switch
                  accessibilityLabel="Accept terms and privacy"
                  value={accepted}
                  onValueChange={setAccepted}
                />
                <T style={{ flex: 1 }}>
                  I’m 18 or older and agree to the terms and privacy policy.
                </T>
              </Row>
            ) : null}
            {action.error ? <Notice error message={action.error} /> : null}
            {session.connectionError ? <Notice error message={session.connectionError} /> : null}
            <Button
              title={
                kind === 'register'
                  ? 'Create my account'
                  : kind === 'recover'
                    ? 'Recover my account'
                    : 'Sign in'
              }
              busy={action.busy}
              disabled={!email || !password || (kind === 'register' && (!name || !accepted))}
              onPress={() =>
                action.run(() =>
                  session.signIn(
                    kind,
                    kind === 'register'
                      ? { name, email, password, accepted }
                      : kind === 'recover'
                        ? { email, password, recoveryCode: code }
                        : { email, password },
                  ),
                )
              }
            />
            <Button
              quiet
              title={kind === 'register' ? 'I already have an account' : 'Create an account'}
              onPress={() => setKind(kind === 'register' ? 'login' : 'register')}
            />
            {kind === 'login' ? (
              <Button quiet title="Use my recovery code" onPress={() => setKind('recover')} />
            ) : null}
          </Stack>
        </Card>
        <Row style={{ flexWrap: 'wrap' }}>
          <Button quiet title="Privacy" onPress={() => router.push('/legal?document=privacy')} />
          <Button quiet title="Terms" onPress={() => router.push('/legal?document=terms')} />
        </Row>
      </Stack>
    </Screen>
  );
}

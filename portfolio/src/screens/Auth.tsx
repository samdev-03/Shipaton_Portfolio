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
import { appId, brand } from '../lib/config';
import { useSession } from '../lib/session';
export default function Auth() {
  const [kind, setKind] = useState('register'),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [code, setCode] = useState(''),
    [accepted, setAccepted] = useState(false),
    [ageBand, setAgeBand] = useState<'16_17' | '18_plus' | ''>(''),
    [guardianConsent, setGuardianConsent] = useState(false),
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
              <Stack>
                {appId === 'rehearsal' ? (
                  <Stack>
                    <T kind="label">Your age range</T>
                    <T kind="caption">
                      Rehearsal Room is for ages 16 and up. We do not ask for your date of birth.
                    </T>
                    <Row>
                      <Pill active={ageBand === '16_17'} onPress={() => setAgeBand('16_17')}>
                        16–17
                      </Pill>
                      <Pill active={ageBand === '18_plus'} onPress={() => setAgeBand('18_plus')}>
                        18 or older
                      </Pill>
                    </Row>
                    {ageBand === '16_17' ? (
                      <>
                        <T kind="caption">
                          Guided practice is available to you. AI practice and voice transcription
                          are for adults 18 and older.
                        </T>
                        <Row>
                          <Switch
                            accessibilityLabel="Parent or guardian permission"
                            value={guardianConsent}
                            onValueChange={setGuardianConsent}
                          />
                          <T style={{ flex: 1 }}>
                            My parent or guardian has reviewed the terms and privacy policy with me
                            and gives permission for me to use this app.
                          </T>
                        </Row>
                      </>
                    ) : null}
                  </Stack>
                ) : null}
                <Row>
                  <Switch
                    accessibilityLabel="Accept terms and privacy"
                    value={accepted}
                    onValueChange={setAccepted}
                  />
                  <T style={{ flex: 1 }}>
                    {appId === 'rehearsal'
                      ? 'I confirm my age range and agree to the terms and privacy policy.'
                      : 'I’m 18 or older and agree to the terms and privacy policy.'}
                  </T>
                </Row>
              </Stack>
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
              disabled={
                !email ||
                !password ||
                (kind === 'register' &&
                  (!name ||
                    !accepted ||
                    (appId === 'rehearsal' &&
                      (!ageBand || (ageBand === '16_17' && !guardianConsent)))))
              }
              onPress={() =>
                action.run(() =>
                  session.signIn(
                    kind,
                    kind === 'register'
                      ? {
                          name,
                          email,
                          password,
                          accepted,
                          ageBand: appId === 'rehearsal' ? ageBand : '18_plus',
                          guardianConsent,
                        }
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

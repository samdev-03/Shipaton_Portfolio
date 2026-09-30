import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Gate } from '../../components/Gate';
import { VoiceInput } from '../../components/VoiceInput';
import {
  Screen,
  Stack,
  T,
  Card,
  Button,
  Field,
  DismissKeyboard,
  Notice,
  Pill,
  Row,
  Stepper,
  useAction,
  palette,
} from '../../components/ui';
import { api } from '../../lib/api';
import { brand } from '../../lib/config';
import { scenarios } from '../../../shared/catalog';
import { useSession } from '../../lib/session';
import { trackSdk } from '../../lib/sdk';
export default function Practice() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    [practice, setPractice] = useState<any>(null),
    [text, setText] = useState(''),
    [retry, setRetry] = useState<number | undefined>(),
    [finish, setFinish] = useState(false),
    [confidence, setConfidence] = useState(3),
    action = useAction(),
    { run } = action,
    { user, entitlement } = useSession();
  const load = useCallback(async () => setPractice(await api('/v1/rehearsals/' + id)), [id]);
  useEffect(() => {
    void run(load);
    return () => {
      void Speech.stop().catch(() => undefined);
    };
  }, [run, load]);
  const scenario = scenarios.find((s) => s.id === practice?.scenarioId);
  return (
    <Screen back title="Your rehearsal">
      <Stack>
        {action.error ? <Notice error message={action.error} /> : null}
        {!practice ? (
          <T>Loading your practice…</T>
        ) : (
          <>
            <Pill>{practice.mode === 'ai' ? 'AI PRACTICE' : 'GUIDED PRACTICE'}</Pill>
            <T kind="hero">{scenario?.title}</T>
            {practice.messages.map((m: any, i: number) => (
              <Card
                key={i}
                style={{
                  backgroundColor: m.role === 'user' ? brand.color : '#fff',
                  marginLeft: m.role === 'user' ? 18 : 0,
                  marginRight: m.role === 'assistant' ? 18 : 0,
                }}
              >
                <Stack gap={10}>
                  <T kind="label">{m.role === 'user' ? 'YOU' : 'YOUR PRACTICE PARTNER'}</T>
                  <T>{m.text}</T>
                  {m.role === 'user' && practice.status === 'active' ? (
                    <Button
                      quiet
                      title="Retry this moment"
                      onPress={() => {
                        setRetry(i);
                        setText(m.text);
                      }}
                    />
                  ) : m.role === 'assistant' ? (
                    <Button
                      quiet
                      title="Hear this response"
                      onPress={() => {
                        void Speech.stop().catch(() => undefined);
                        Speech.speak(m.text);
                      }}
                    />
                  ) : null}
                </Stack>
              </Card>
            ))}
            {practice.feedback ? (
              <Card>
                <Stack>
                  <T kind="label">A SMALL ADJUSTMENT</T>
                  <T>{practice.feedback.strength}</T>
                  <T>{practice.feedback.next}</T>
                  <Row style={{ flexWrap: 'wrap' }}>
                    {['clarity', 'empathy', 'specificity'].map((k) => (
                      <Pill key={k}>
                        {k} · {practice.feedback[k]}/3
                      </Pill>
                    ))}
                  </Row>
                  <T kind="caption">
                    Informal wording cues, not a validated assessment of you or your career.
                  </T>
                </Stack>
              </Card>
            ) : null}
            {practice.status === 'active' && !finish ? (
              <>
                <Field
                  label={retry !== undefined ? 'Try a new response' : 'Your next sentence'}
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={3000}
                />
                <DismissKeyboard />
                {user?.preferences.ai && entitlement?.active ? (
                  <VoiceInput onText={setText} />
                ) : null}
                <Button
                  title={retry !== undefined ? 'Try that moment again →' : 'Send response →'}
                  disabled={!text.trim()}
                  busy={action.busy}
                  onPress={() =>
                    action.run(async () => {
                      Keyboard.dismiss();
                      const p = await api(`/v1/rehearsals/${id}/turn`, 'POST', {
                        text,
                        version: practice.version,
                        ...(retry !== undefined ? { retryIndex: retry } : {}),
                      });
                      setPractice(p);
                      if (retry !== undefined) trackSdk('moment_retried');
                      setRetry(undefined);
                      setText('');
                    })
                  }
                />
                {retry !== undefined ? (
                  <Button
                    quiet
                    title="Cancel retry"
                    onPress={() => {
                      setRetry(undefined);
                      setText('');
                    }}
                  />
                ) : null}
                <Button
                  quiet
                  title="Finish and reflect"
                  disabled={practice.messages.length < 3}
                  onPress={() => {
                    Keyboard.dismiss();
                    setFinish(true);
                  }}
                />
              </>
            ) : practice.status === 'active' ? (
              <Card>
                <Stack>
                  <Stepper
                    label="How ready do you feel now?"
                    value={confidence}
                    onChange={setConfidence}
                  />
                  <Button
                    title="Save my practice"
                    busy={action.busy}
                    onPress={() =>
                      action.run(async () => {
                        await api(`/v1/rehearsals/${id}/complete`, 'POST', { confidence });
                        trackSdk('rehearsal_completed');
                        router.replace('/activity');
                      })
                    }
                  />
                  <Button quiet title="Keep practicing" onPress={() => setFinish(false)} />
                </Stack>
              </Card>
            ) : (
              <Notice message="Practice saved. Your reflection is private." />
            )}
            <T style={{ color: palette.muted }}>
              Try words that sound like you. Pause whenever you need.
            </T>
          </>
        )}
      </Stack>
    </Screen>
  );
}

import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Gate } from '../components/Gate';
import {
  Screen,
  Stack,
  T,
  Card,
  Button,
  Pill,
  Row,
  Stepper,
  Notice,
  useAction,
} from '../components/ui';
import { scenarios } from '../../shared/catalog';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
import { trackSdk } from '../lib/sdk';
export default function Start() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const { scenario } = useLocalSearchParams<{ scenario: string }>(),
    s = scenarios.find((x) => x.id === scenario) || scenarios[0],
    [confidence, setConfidence] = useState(3),
    [mode, setMode] = useState('guided'),
    action = useAction(),
    { user, entitlement, config } = useSession();
  return (
    <Screen back>
      <Stack>
        <Pill>{s.category}</Pill>
        <T kind="hero">{s.title}</T>
        <T>{s.goal}</T>
        <Card>
          <Stack>
            <T kind="label">THE MOMENT</T>
            <T style={{ fontSize: 20, lineHeight: 30 }}>{s.opening}</T>
            <T kind="caption">Practice privately. Use fictional details.</T>
          </Stack>
        </Card>
        <Stepper label="How ready do you feel?" value={confidence} onChange={setConfidence} />
        <T kind="label">YOUR PRACTICE MODE</T>
        <Row>
          <Pill active={mode === 'guided'} onPress={() => setMode('guided')}>
            Guided practice
          </Pill>
          <Pill active={mode === 'ai'} onPress={() => setMode('ai')}>
            AI counterpart · Pro · 18+
          </Pill>
        </Row>
        <T kind="caption">
          Guided practice uses fixed prompts and transparent wording cues. AI mode responds to your
          conversation and sends selected text to OpenAI.
        </T>
        {mode === 'ai' && !user?.preferences.ai ? (
          <Button
            quiet
            title="Review AI consent in Settings"
            onPress={() => router.push('/settings')}
          />
        ) : null}
        {action.error ? <Notice error message={action.error} /> : null}
        <Button
          title="Step into the room →"
          busy={action.busy}
          disabled={
            mode === 'ai' && (!user?.aiEligible || !user?.preferences.ai || !config.aiAvailable)
          }
          onPress={() =>
            action.run(async () => {
              if ((s.premium || mode === 'ai') && !entitlement?.active) {
                router.push('/pro');
                return;
              }
              const r = await api('/v1/rehearsals', 'POST', { scenarioId: s.id, mode, confidence });
              trackSdk('scenario_started');
              router.replace(`/practice/${r.id}` as any);
            })
          }
        />
        {mode === 'ai' && !config.aiAvailable ? (
          <Notice message="AI is unavailable right now. Guided practice is ready to use." />
        ) : null}
        {mode === 'ai' && !user?.aiEligible ? (
          <Notice message="AI practice and transcription are available to adults 18 and older. Choose guided practice to continue." />
        ) : null}
      </Stack>
    </Screen>
  );
}

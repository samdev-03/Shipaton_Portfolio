import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { Button, Field, Notice, Pill, Row, Stack, T, useAction } from './ui';
import { api } from '../lib/api';

const reasons = [
  ['harmful', 'Harmful or unsafe'],
  ['offensive', 'Offensive or abusive'],
  ['misleading', 'Misleading'],
  ['privacy', 'Privacy concern'],
  ['other', 'Other'],
] as const;

export function ReportAIContent({
  rehearsalId,
  version,
  target,
}: {
  rehearsalId: string;
  version: number;
  target: number | 'feedback';
}) {
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState(''),
    [note, setNote] = useState(''),
    [sentVersion, setSentVersion] = useState<number>(),
    action = useAction();
  if (sentVersion === version)
    return <Notice message="Report received. Thank you for helping improve practice safety." />;
  if (!open)
    return (
      <Button
        quiet
        title={target === 'feedback' ? 'Report AI feedback' : 'Report AI response'}
        onPress={() => setOpen(true)}
      />
    );
  return (
    <Stack gap={12}>
      <T kind="label">Report a concern</T>
      <T kind="caption">
        Sending shares this selected AI response or feedback, the scenario and your note with our
        operator for safety review. The rest of your conversation is not included. Avoid personal or
        confidential details.
      </T>
      <Row style={{ flexWrap: 'wrap' }}>
        {reasons.map(([value, label]) => (
          <Pill key={value} active={reason === value} onPress={() => setReason(value)}>
            {label}
          </Pill>
        ))}
      </Row>
      <Field
        label="Report details (optional)"
        value={note}
        onChangeText={setNote}
        maxLength={1000}
        multiline
      />
      {action.error ? <Notice error message={action.error} /> : null}
      <Button
        title="Send report"
        disabled={!reason}
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            Keyboard.dismiss();
            await api(`/v1/rehearsals/${rehearsalId}/report`, 'POST', {
              version,
              target,
              reason,
              note,
              consent: true,
            });
            setSentVersion(version);
            setNote('');
            setOpen(false);
          })
        }
      />
      <Button
        quiet
        title="Cancel report"
        disabled={action.busy}
        onPress={() => {
          setOpen(false);
          action.setError('');
        }}
      />
    </Stack>
  );
}

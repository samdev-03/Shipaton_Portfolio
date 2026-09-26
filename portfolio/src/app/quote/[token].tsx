import React, { useEffect, useState } from 'react';
import { Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
import { money } from '../../../shared/domain';
export default function Approval() {
  const { token } = useLocalSearchParams<{ token: string }>(),
    [quote, setQuote] = useState<any>(null),
    [name, setName] = useState(''),
    [accepted, setAccepted] = useState(false),
    a = useAction(),
    { run } = a;
  useEffect(() => {
    void run(async () => setQuote(await api('/v1/public/quotes/' + token)));
  }, [run, token]);
  return (
    <Screen title="Your service quote">
      <Stack>
        <Pill>REVIEW BEFORE YOU AGREE</Pill>
        <T kind="hero">A clear next step.</T>
        {a.error ? <Notice error message={a.error} /> : null}
        {quote ? (
          <>
            <T kind="title">{quote.business}</T>
            <T>Prepared for {quote.customer}</T>
            <Card>
              <Stack>
                <T>{quote.scope}</T>
                {quote.items.map((x: any, i: number) => (
                  <T key={i}>
                    {x.quantity} × {x.description} · {money(x.unitCents * x.quantity)}
                  </T>
                ))}
                <T>Subtotal {money(quote.subtotalCents)}</T>
                <T>Tax {money(quote.taxCents)}</T>
                <T kind="title">Total {money(quote.totalCents)}</T>
                <T>Deposit requested {money(quote.depositCents)}</T>
                <T>Valid through {quote.validUntil}</T>
                {quote.notes ? <T>{quote.notes}</T> : null}
              </Stack>
            </Card>
            {quote.status === 'accepted' ? (
              <Notice
                message={
                  'Accepted by ' +
                  quote.accepted.name +
                  '. Service payments are arranged directly with the business.'
                }
              />
            ) : (
              <Card>
                <Stack>
                  <Field label="Your name" value={name} onChangeText={setName} />
                  <Row>
                    <Switch
                      accessibilityLabel="I agree to this quote"
                      value={accepted}
                      onValueChange={setAccepted}
                    />
                    <T style={{ flex: 1 }}>
                      I have reviewed the scope and total, and agree to this quote.
                    </T>
                  </Row>
                  <Button
                    title="Accept this quote"
                    disabled={!name.trim() || !accepted}
                    busy={a.busy}
                    onPress={() =>
                      a.run(async () =>
                        setQuote(
                          await api('/v1/public/quotes/' + token + '/accept', 'POST', {
                            name,
                            accepted,
                          }),
                        ),
                      )
                    }
                  />
                  <T kind="caption">
                    This records your acceptance. It does not charge a card or collect payment.
                  </T>
                </Stack>
              </Card>
            )}
          </>
        ) : null}
      </Stack>
    </Screen>
  );
}

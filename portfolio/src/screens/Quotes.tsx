import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
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
  palette,
} from '../components/ui';
import { api } from '../lib/api';
import { brand } from '../lib/config';
import { LineItem, money, quoteTotals } from '../../shared/domain';
import { useSession } from '../lib/session';
import { useFirstStepExperiment } from '../lib/experiment';
import { trackSdk } from '../lib/sdk';
export default function Quotes() {
  const variant = useFirstStepExperiment(),
    [quotes, setQuotes] = useState<any[]>([]),
    [create, setCreate] = useState(false),
    [business, setBusiness] = useState(''),
    [customer, setCustomer] = useState(''),
    [scope, setScope] = useState(''),
    [notes, setNotes] = useState(''),
    [tax, setTax] = useState('0'),
    [deposit, setDeposit] = useState('0'),
    [expiry, setExpiry] = useState(() =>
      new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    ),
    [items, setItems] = useState<LineItem[]>([
      { description: 'Standard home clean', quantity: 1, unitCents: 12000 },
    ]),
    [prices, setPrices] = useState(['120.00']),
    [message, setMessage] = useState(''),
    a = useAction(),
    { run } = a,
    { entitlement } = useSession();
  const load = useCallback(async () => setQuotes((await api('/v1/quotes')).items), []);
  useFocusEffect(
    useCallback(() => {
      void run(load);
    }, [run, load]),
  );
  let totals;
  try {
    totals = quoteTotals(items, Math.round(Number(tax) * 100), Number(deposit));
  } catch {
    totals = null;
  }
  const edit = (i: number, patch: Partial<LineItem>) =>
    setItems(items.map((x, n) => (n === i ? { ...x, ...patch } : x)));
  return (
    <Screen footer={<Tabs />}>
      <Stack>
        <Pill>FOR INDEPENDENT HOME CLEANERS</Pill>
        <T kind="hero">Clear scope. Confident quotes.</T>
        <T style={{ color: palette.muted }}>
          Put the job in writing. Give your customer a simple next step.
        </T>
        <Card style={{ backgroundColor: brand.color }}>
          <Stack>
            <T kind="label">YOUR QUOTE BOOK</T>
            <T kind="title">{quotes.filter((q) => q.status === 'accepted').length} approved</T>
            <T kind="caption">
              {quotes.filter((q) => q.status === 'sent').length} awaiting a reply
            </T>
            <Button
              title={
                create ? 'Close draft' : variant === 'B' ? 'Start a clear quote +' : 'New quote +'
              }
              onPress={() => setCreate(!create)}
            />
          </Stack>
        </Card>
        {a.error ? <Notice error message={a.error} /> : null}
        {message ? <Notice message={message} /> : null}
        {create ? (
          <Card>
            <Stack>
              <T kind="title">Let’s get the details right.</T>
              <Field label="Your business name" value={business} onChangeText={setBusiness} />
              <Field label="Customer name" value={customer} onChangeText={setCustomer} />
              <Field
                label="Work included and exclusions"
                value={scope}
                onChangeText={setScope}
                multiline
                placeholder="Kitchen and bathrooms. Windows excluded."
              />
              {items.map((item, i) => (
                <Card key={i} style={{ padding: 14 }}>
                  <Stack>
                    <Field
                      label={`Item ${i + 1}`}
                      value={item.description}
                      onChangeText={(description) => edit(i, { description })}
                    />
                    <Field
                      label={`Quantity ${i + 1}`}
                      value={String(item.quantity)}
                      onChangeText={(v) => edit(i, { quantity: Number(v) })}
                      keyboardType="number-pad"
                    />
                    <Field
                      label={`Unit price ${i + 1} · USD`}
                      value={prices[i]}
                      onChangeText={(v) => {
                        setPrices(prices.map((x, n) => (n === i ? v : x)));
                        edit(i, { unitCents: Math.round(Number(v) * 100) });
                      }}
                      keyboardType="decimal-pad"
                    />
                    {items.length > 1 ? (
                      <Button
                        quiet
                        title={`Remove item ${i + 1}`}
                        onPress={() => {
                          setItems(items.filter((_, n) => n !== i));
                          setPrices(prices.filter((_, n) => n !== i));
                        }}
                      />
                    ) : null}
                  </Stack>
                </Card>
              ))}
              <Button
                quiet
                title="Add line item"
                disabled={items.length >= 30}
                onPress={() => {
                  setItems([...items, { description: '', quantity: 1, unitCents: 0 }]);
                  setPrices([...prices, '0.00']);
                }}
              />
              <Field
                label="Tax rate · percent"
                value={tax}
                onChangeText={setTax}
                keyboardType="decimal-pad"
              />
              <Field
                label="Deposit · whole percent"
                value={deposit}
                onChangeText={setDeposit}
                keyboardType="number-pad"
              />
              <Field label="Valid through · YYYY-MM-DD" value={expiry} onChangeText={setExpiry} />
              <Field
                label="Payment instructions (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
              {totals ? (
                <>
                  <T kind="title">Total {money(totals.totalCents)}</T>
                  <T>Deposit {money(totals.depositCents)}</T>
                </>
              ) : (
                <Notice error message="Check the quantities, prices, tax and deposit." />
              )}
              <T kind="caption">
                You determine applicable taxes. Approval records agreement to this scope; service
                payments are arranged separately.
              </T>
              <Button
                title="Save quote"
                busy={a.busy}
                disabled={!totals || !business || !customer || !scope}
                onPress={() =>
                  a.run(async () => {
                    await api('/v1/quotes', 'POST', {
                      business,
                      customer,
                      scope,
                      notes,
                      items,
                      taxBps: Math.round(Number(tax) * 100),
                      depositPercent: Number(deposit),
                      validUntil: expiry,
                    });
                    trackSdk('quote_created');
                    setCreate(false);
                    setCustomer('');
                    setScope('');
                    setNotes('');
                    await load();
                  })
                }
              />
              {entitlement?.active ? (
                <Button
                  quiet
                  title="Save scope as a template"
                  disabled={!scope}
                  onPress={() =>
                    a.run(async () => {
                      await api('/v1/templates', 'POST', {
                        name: items[0].description || 'Scope template',
                        content: scope,
                      });
                      setMessage('Template saved in Your progress.');
                    })
                  }
                />
              ) : null}
            </Stack>
          </Card>
        ) : null}
        {quotes.map((q) => (
          <Card key={q.id}>
            <Stack>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Pill active={q.status === 'accepted'}>{q.status}</Pill>
                <T kind="caption">Valid through {q.validUntil}</T>
              </Row>
              <T kind="title">{q.customer}</T>
              <T>{q.scope}</T>
              <T kind="title">{money(q.totalCents)}</T>
              {q.status === 'accepted' ? (
                <T kind="caption">
                  Accepted by {q.accepted.name} on {new Date(q.accepted.at).toLocaleDateString()}
                </T>
              ) : (
                <>
                  <Button
                    title={
                      q.status === 'sent' ? 'Create a fresh approval link' : 'Create approval link'
                    }
                    onPress={() =>
                      a.run(async () => {
                        const r = await api(`/v1/quotes/${q.id}/share`, 'POST', {});
                        await Clipboard.setStringAsync(r.url);
                        setMessage(
                          'Approval link copied. Anyone with the link can read and accept this quote. A previous link is now invalid.',
                        );
                        await load();
                      })
                    }
                  />
                  {q.status === 'sent' ? (
                    <Button
                      quiet
                      title="Revoke approval link"
                      onPress={() =>
                        a.run(async () => {
                          await api(`/v1/quotes/${q.id}/revoke`, 'POST', {});
                          await load();
                          setMessage('Link revoked.');
                        })
                      }
                    />
                  ) : null}
                  <Button
                    quiet
                    title="Remind me to follow up"
                    onPress={() => router.push('/reminders')}
                  />
                </>
              )}
            </Stack>
          </Card>
        ))}
        {!quotes.length && !create ? (
          <T>Your first quote starts with a clear scope. Tap the button above to begin.</T>
        ) : null}
      </Stack>
    </Screen>
  );
}

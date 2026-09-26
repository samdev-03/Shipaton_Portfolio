import React, { useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { Gate } from '../components/Gate';
import { Screen, Stack, T, Card, Button, Notice, Pill, Row, useAction } from '../components/ui';
import { appId, brand } from '../lib/config';
import { plans } from '../../shared/catalog';
import { initializeSdk, packages, buy, restore, manageSubscription, trackSdk } from '../lib/sdk';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
export default function Pro() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
function Content() {
  const [offers, setOffers] = useState<any[]>([]),
    [message, setMessage] = useState(''),
    a = useAction(),
    { run } = a,
    { user, entitlement, config, refresh } = useSession(),
    id = user?.id;
  useEffect(() => {
    if (!id) return;
    void run(async () => {
      await initializeSdk(id);
      setOffers(await packages());
    });
    trackSdk('paywall_viewed');
    void api('/v1/events', 'POST', { id: randomUUID(), name: 'paywall_viewed' }).catch(() => {});
  }, [run, id]);
  const period = (p: string) =>
    p === 'P1M' ? 'month' : p === 'P1Y' ? 'year' : p || 'billing period';
  return (
    <Screen back title={brand.name + ' Pro'}>
      <Stack>
        <Pill>MAKE ROOM FOR MORE</Pill>
        <T kind="hero">Keep the momentum. At your own pace.</T>
        <T>The free tools stay yours. Pro supports a little more room to grow.</T>
        {a.error ? <Notice error message={a.error} /> : null}
        {message ? <Notice message={message} /> : null}
        <Card>
          <Stack>
            <T kind="title">Included with Pro</T>
            {plans[appId].pro.map((x) => (
              <T key={x}>✓ {x}</T>
            ))}
          </Stack>
        </Card>
        {entitlement?.active ? (
          <Notice message="Pro is active on your account." />
        ) : Platform.OS === 'web' ? (
          <Card>
            <Stack>
              <T kind="title">One account. Web to app.</T>
              <T>Use the same account in the mobile app after checkout.</T>
              <Button
                title="View plans and checkout"
                disabled={!config.funnelAvailable}
                busy={a.busy}
                onPress={() =>
                  a.run(async () => {
                    const r = await api('/v1/funnel');
                    await Linking.openURL(r.url);
                  })
                }
              />
              {!config.funnelAvailable ? (
                <T kind="caption">
                  Plans are unavailable right now. Your free tools are ready to use.
                </T>
              ) : null}
            </Stack>
          </Card>
        ) : offers.length ? (
          offers.map((p) => (
            <Card key={p.identifier}>
              <Stack>
                <T kind="title">{p.product.title}</T>
                <T>{p.product.description}</T>
                <T kind="hero" style={{ fontSize: 34 }}>
                  {p.product.priceString}
                </T>
                <T>per {period(p.product.subscriptionPeriod)}</T>
                {p.product.introPrice ? (
                  <T kind="caption">
                    The store confirms any introductory offer and your eligibility before purchase.
                  </T>
                ) : null}
                <Button
                  title={'Continue with ' + p.product.title}
                  busy={a.busy}
                  onPress={() =>
                    a.run(async () => {
                      await buy(p);
                      await api('/v1/billing/sync', 'POST', {});
                      await refresh();
                      trackSdk('purchase_completed');
                      setMessage('Purchase checked. Your access is up to date.');
                    })
                  }
                />
                <T kind="caption">
                  Payment is charged to your store account. The subscription renews automatically
                  unless cancelled before renewal. Manage cancellation in your store’s subscription
                  settings.
                </T>
              </Stack>
            </Card>
          ))
        ) : (
          <Notice message="Plans are unavailable right now. Keep using the free tools." />
        )}
        <Button
          quiet
          title={Platform.OS === 'web' ? 'Refresh my access' : 'Restore purchases'}
          busy={a.busy}
          onPress={() =>
            a.run(async () => {
              if (Platform.OS !== 'web') await restore();
              const r = await api('/v1/billing/sync', 'POST', {});
              await refresh();
              setMessage(
                r.entitlement.active
                  ? 'Your access has been restored.'
                  : 'No active Pro subscription was found.',
              );
            })
          }
        />
        {Platform.OS !== 'web' ? (
          <Button quiet title="Manage subscription" onPress={() => a.run(manageSubscription)} />
        ) : (
          <T kind="caption">
            Manage web subscription cancellation using the billing link in your purchase receipt.
            Contact support if you need help.
          </T>
        )}
        <Row>
          <Button quiet title="Terms" onPress={() => router.push('/legal?document=terms')} />
          <Button quiet title="Privacy" onPress={() => router.push('/legal?document=privacy')} />
        </Row>
      </Stack>
    </Screen>
  );
}

import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Screen, Stack, T, Row, Pill, Card, Button, Tabs, palette } from '../components/ui';
import { useSession } from '../lib/session';
import { useFirstStepExperiment } from '../lib/experiment';
import { brand } from '../lib/config';
import { scenarios } from '../../shared/catalog';
export default function RehearsalHome() {
  const { user, entitlement } = useSession(),
    variant = useFirstStepExperiment(),
    wide = useWindowDimensions().width > 760;
  return (
    <Screen footer={<Tabs />}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T kind="label">ONE SMALL PRACTICE.</T>
        <Pill>{entitlement?.active ? 'PRO' : 'FREE'}</Pill>
      </Row>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24 }}>
        <Stack style={{ flex: 1 }} gap={18}>
          <T kind="hero">The real conversation starts here.</T>
          <T style={{ color: palette.muted, fontSize: 18, lineHeight: 28 }}>
            Hi {user?.name.split(' ')[0]}. You don’t need perfect words. Just a little room to find
            them.
          </T>
          <Row>
            <Pill>4-minute practice</Pill>
            <Pill>At your pace</Pill>
          </Row>
          <Button
            title={variant === 'B' ? 'Find my next sentence →' : 'Start a small practice →'}
            onPress={() => router.push('/start?scenario=workload')}
          />
        </Stack>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            minHeight: 235,
            flex: wide ? 1 : undefined,
            backgroundColor: brand.color,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: 160,
              height: 115,
              borderRadius: 50,
              borderBottomLeftRadius: 8,
              backgroundColor: brand.ink,
              transform: [{ rotate: '-8deg' }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Row style={{ gap: 9 }}>
              {[22, 38, 57, 36, 22].map((h, i) => (
                <View
                  key={i}
                  style={{ width: 8, height: h, borderRadius: 5, backgroundColor: brand.color }}
                />
              ))}
            </Row>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 15,
              right: 16,
              padding: 13,
              borderRadius: 18,
              backgroundColor: '#fff',
              transform: [{ rotate: '4deg' }],
            }}
          >
            <T kind="caption">“Let me try that again.”</T>
          </View>
        </View>
      </View>
      <T kind="title">What’s on your mind?</T>
      <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: 14 }}>
        {scenarios.map((s, i) => (
          <Card key={s.id} style={{ width: wide ? '48.8%' : '100%' }}>
            <Stack>
              <Row style={{ justifyContent: 'space-between' }}>
                <T kind="label">{s.category}</T>
                <T kind="caption">0{i + 1}</T>
              </Row>
              <T kind="title">{s.title}</T>
              <T style={{ color: palette.muted }}>{s.goal}</T>
              <Row>
                <Pill>{s.premium ? 'Pro' : 'Free'}</Pill>
                <T kind="caption">4 MIN · YOUR PACE</T>
              </Row>
              <Button
                quiet
                title={'Practice: ' + s.title}
                onPress={() =>
                  router.push(
                    s.premium && !entitlement?.active ? '/pro' : (`/start?scenario=${s.id}` as any),
                  )
                }
              />
            </Stack>
          </Card>
        ))}
      </View>
      <Card style={{ backgroundColor: brand.ink }}>
        <T style={{ fontSize: 19, lineHeight: 29, color: brand.color }}>
          Confidence isn’t always knowing what to say. Sometimes it’s being willing to try again.
        </T>
      </Card>
    </Screen>
  );
}

import React, { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSession } from '../lib/session';
import Auth from '../screens/Auth';
import { Screen, Stack, T, Card, Button, Notice } from './ui';
export function Gate({ children }: { children: ReactNode }) {
  const s = useSession();
  if (s.loading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel="Loading" />
      </Screen>
    );
  if (!s.user) return <Auth />;
  if (s.recoveryCode)
    return (
      <Screen>
        <Stack>
          <T kind="hero">Keep a key to your space.</T>
          <Notice message="Save this recovery code somewhere private. It is shown once and is the way to reset your password." />
          <Card>
            <T selectable>{s.recoveryCode}</T>
          </Card>
          <Button
            quiet
            title="Copy recovery code"
            onPress={() => void Clipboard.setStringAsync(s.recoveryCode)}
          />
          <Button title="I saved it. Continue" onPress={s.clearRecovery} />
        </Stack>
      </Screen>
    );
  return <>{children}</>;
}

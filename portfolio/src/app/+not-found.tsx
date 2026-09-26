import React from 'react';
import { router } from 'expo-router';
import { Screen, T, Button } from '../components/ui';
export default function Missing() {
  return (
    <Screen>
      <T kind="hero">Let’s find your way back.</T>
      <T>This page is unavailable.</T>
      <Button title="Go home" onPress={() => router.replace('/')} />
    </Screen>
  );
}

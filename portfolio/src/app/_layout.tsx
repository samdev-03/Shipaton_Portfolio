import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display/400Regular';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { SessionProvider } from '../lib/session';
export default function Layout() {
  const [ready, error] = useFonts({ DMSerifDisplay_400Regular, DMSans_400Regular, DMSans_700Bold });
  if (!ready && !error)
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F7F8F1' }}>
        <ActivityIndicator accessibilityLabel="Loading your space" />
      </View>
    );
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </SessionProvider>
  );
}

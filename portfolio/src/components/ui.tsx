import React, { ReactNode, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { brand } from '../lib/config';
export const palette = { ink: brand.ink, muted: '#606B65', line: '#DFE2DB', danger: '#9C3636' };
export function T({
  children,
  kind = 'body',
  style,
  ...rest
}: {
  children: ReactNode;
  kind?: 'hero' | 'title' | 'label' | 'caption' | 'body';
  style?: any;
  [key: string]: any;
}) {
  return (
    <Text
      {...rest}
      style={[
        styles.text,
        kind === 'hero' && styles.hero,
        kind === 'title' && styles.title,
        kind === 'label' && styles.label,
        kind === 'caption' && styles.caption,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Stack({
  children,
  gap = 16,
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: any;
}) {
  return <View style={[{ gap }, style]}>{children}</View>;
}
export function Row({ children, style }: { children: ReactNode; style?: any }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>
  );
}
export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Button({
  title,
  onPress,
  quiet = false,
  disabled = false,
  busy = false,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  quiet?: boolean;
  disabled?: boolean;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        quiet && { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.line },
        danger && { backgroundColor: palette.danger },
        (pressed || disabled || busy) && { opacity: 0.65 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={quiet ? brand.ink : '#fff'} />
      ) : (
        <Text style={[styles.buttonText, quiet && { color: brand.ink }]}>{title}</Text>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <Stack gap={6}>
      <T kind="label">{label}</T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#768178"
        {...props}
        style={[
          styles.field,
          props.multiline && { minHeight: 104, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </Stack>
  );
}
export function Pill({
  children,
  active = false,
  onPress,
}: {
  children: ReactNode;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.pill, active && { backgroundColor: brand.color, borderColor: brand.ink }]}
    >
      <T kind="caption" style={{ color: brand.ink }}>
        {children}
      </T>
    </Pressable>
  );
}
export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{ padding: 16, borderRadius: 14, backgroundColor: error ? '#FBE8E6' : '#EAF0E1' }}
    >
      <T style={error ? { color: palette.danger } : undefined}>{message}</T>
    </View>
  );
}
export function Screen({
  children,
  title,
  back = false,
  footer,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  footer?: ReactNode;
}) {
  const wide = useWindowDimensions().width > 760;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brand.background }}>
      <Row
        style={{
          paddingHorizontal: 24,
          height: 74,
          borderBottomWidth: 1,
          borderBottomColor: palette.line,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={back ? 'Go back' : 'Home'}
          onPress={() => (back && router.canGoBack() ? router.back() : router.replace('/'))}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: brand.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <T style={{ fontSize: 24 }}>{back ? '‹' : brand.name.charAt(0).toLowerCase()}</T>
        </Pressable>
        <T style={{ fontFamily: 'DMSans_700Bold', fontSize: 17 }}>{title || brand.name}</T>
      </Row>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: wide ? 36 : 24, paddingBottom: 40, alignItems: 'center' }}
      >
        <View style={{ width: '100%', maxWidth: 1000, gap: 24 }}>{children}</View>
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}
export function Tabs({ active = 'home' }: { active?: string }) {
  return (
    <Row style={{ backgroundColor: '#fff', borderTopWidth: 1, borderColor: palette.line, gap: 0 }}>
      {[
        { id: 'home', label: 'Home', path: '/' },
        { id: 'activity', label: 'Your progress', path: '/activity' },
        { id: 'settings', label: 'Settings', path: '/settings' },
      ].map((x) => (
        <Pressable
          key={x.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === x.id }}
          onPress={() => router.replace(x.path as any)}
          style={{
            flex: 1,
            minHeight: 55,
            justifyContent: 'center',
            alignItems: 'center',
            borderTopWidth: 3,
            borderTopColor: active === x.id ? brand.ink : 'transparent',
          }}
        >
          <T kind="caption" style={{ color: active === x.id ? brand.ink : palette.muted }}>
            {x.label}
          </T>
        </Pressable>
      ))}
    </Row>
  );
}
export function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <Stack gap={10}>
      <T kind="label">{label}</T>
      <Row>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${n} of 5`}
            accessibilityState={{ selected: value === n }}
            onPress={() => onChange(n)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              borderWidth: 1,
              borderColor: palette.line,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: value === n ? brand.color : '#fff',
            }}
          >
            <T>{n}</T>
          </Pressable>
        ))}
      </Row>
      <T kind="caption">1 · not yet comfortable 5 · ready to try</T>
    </Stack>
  );
}
export function useAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    running = useRef(false);
  const run = useCallback(async (fn: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, []);
  return { busy, error, run, setError };
}
const styles = StyleSheet.create({
  text: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24, color: brand.ink },
  hero: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 43,
    lineHeight: 49,
    letterSpacing: -1,
  },
  title: { fontFamily: 'DMSans_700Bold', fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  label: { fontFamily: 'DMSans_700Bold', fontSize: 11, lineHeight: 16, letterSpacing: 1.6 },
  caption: { fontSize: 13, lineHeight: 20, color: palette.muted },
  card: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.line,
  },
  button: {
    backgroundColor: brand.ink,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontFamily: 'DMSans_700Bold', fontSize: 15, lineHeight: 22, color: '#fff' },
  field: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: brand.ink,
    padding: 14,
    minHeight: 52,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BBC5BC',
    borderRadius: 12,
  },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: palette.line,
  },
});

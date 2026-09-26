import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { appId, config } from './config';
let session: string | null = null;
const key = 'session_' + appId;
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function loadSession() {
  if (Platform.OS !== 'web') session = await SecureStore.getItemAsync(key);
}
export async function saveSession(value: string | null) {
  session = value;
  if (Platform.OS !== 'web') {
    if (value)
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    else await SecureStore.deleteItemAsync(key);
  }
}
export async function api(path: string, method = 'GET', body?: unknown): Promise<any> {
  try {
    const r = await fetch(config.apiUrl + path, {
      method,
      credentials: 'include',
      headers: {
        'X-App-ID': appId,
        'X-Client': Platform.OS === 'web' ? 'web' : 'native',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(session ? { Authorization: 'Bearer ' + session } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(28000),
    });
    const data = await r.json();
    if (!r.ok) throw new ApiError(data.error || 'Request failed.', r.status);
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw Error('Could not connect. Your input is still here; please try again.');
  }
}
export async function transcribe(uri: string) {
  let bytes: ArrayBuffer,
    mime = 'audio/mp4';
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    bytes = await blob.arrayBuffer();
    mime = blob.type.split(';')[0] || 'audio/webm';
  } else {
    const { File } = await import('expo-file-system');
    bytes = await new File(uri).arrayBuffer();
  }
  const r = await fetch(config.apiUrl + '/v1/audio/transcribe', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-App-ID': appId,
      'Content-Type': mime,
      ...(session ? { Authorization: 'Bearer ' + session } : {}),
    },
    body: bytes,
    signal: AbortSignal.timeout(28000),
  });
  const d = await r.json();
  if (!r.ok) throw new ApiError(d.error, r.status);
  return d.text as string;
}

import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import {
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { Button, Notice, Stack, T, useAction } from './ui';
import { transcribe } from '../lib/api';
export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY),
    state = useAudioRecorderState(recorder),
    action = useAction(),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  async function remove(uri: string | null) {
    if (!uri) return;
    if (Platform.OS === 'web') {
      URL.revokeObjectURL(uri);
      return;
    }
    const { File } = await import('expo-file-system');
    const f = new File(uri);
    if (f.exists) f.delete();
  }
  useEffect(() => {
    const listener = AppState.addEventListener('change', (s) => {
      if (s !== 'active' && recorder.isRecording)
        void recorder.stop().then(() => remove(recorder.uri));
    });
    return () => {
      listener.remove();
      if (timer.current) clearTimeout(timer.current);
      if (recorder.isRecording) void recorder.stop().then(() => remove(recorder.uri));
    };
  }, [recorder]);
  return (
    <Stack gap={10}>
      <Button
        quiet
        title={state.isRecording ? 'Stop and use recording' : 'Use my voice · up to 60 seconds'}
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (state.isRecording) {
              if (timer.current) clearTimeout(timer.current);
              await recorder.stop();
              const uri = recorder.uri;
              try {
                if (uri) onText(await transcribe(uri));
              } finally {
                await remove(uri);
                await setAudioModeAsync({ allowsRecording: false });
              }
            } else {
              const p = await requestRecordingPermissionsAsync();
              if (!p.granted)
                throw Error('Microphone permission was not granted. You can keep typing.');
              await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
              await recorder.prepareToRecordAsync();
              recorder.record();
              timer.current = setTimeout(() => {
                void action.run(async () => {
                  await recorder.stop();
                  const uri = recorder.uri;
                  try {
                    if (uri) onText(await transcribe(uri));
                  } finally {
                    await remove(uri);
                    await setAudioModeAsync({ allowsRecording: false });
                  }
                });
              }, 60000);
            }
          })
        }
      />
      {state.isRecording ? (
        <T kind="caption">Recording · {Math.round(state.durationMillis / 1000)} seconds</T>
      ) : null}
      {action.error ? <Notice error message={action.error} /> : null}
      <T kind="caption">
        Your recording is sent to OpenAI for transcription. Review the text before sending it.
      </T>
    </Stack>
  );
}

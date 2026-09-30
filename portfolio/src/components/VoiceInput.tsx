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
import { createVoiceSession } from '../lib/voice-session';
export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY),
    state = useAudioRecorderState(recorder),
    action = useAction(),
    { run, setError } = action,
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    session = useRef<ReturnType<typeof createVoiceSession> | null>(null),
    onTextRef = useRef(onText);
  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);
  useEffect(() => {
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
    const capture = createVoiceSession({
      recorder,
      initialUri: recorder.uri,
      permission: requestRecordingPermissionsAsync,
      recordingMode: (enabled) =>
        setAudioModeAsync({ allowsRecording: enabled, playsInSilentMode: true }),
      remove,
      transcribe,
      onText: (text) => onTextRef.current(text),
    });
    session.current = capture;
    const listener = AppState.addEventListener('change', (s) => {
      if (s !== 'active' && capture.isRecording) {
        if (timer.current) clearTimeout(timer.current);
        void run(async () => {
          await capture.finish(false);
          setError('Recording stopped while the app was inactive. You can keep typing.');
        });
      }
    });
    return () => {
      listener.remove();
      if (timer.current) clearTimeout(timer.current);
      session.current = null;
      void capture.dispose();
    };
  }, [recorder, run, setError]);
  return (
    <Stack gap={10}>
      <Button
        quiet
        title={state.isRecording ? 'Stop and use recording' : 'Use my voice · up to 60 seconds'}
        busy={action.busy}
        onPress={() =>
          run(async () => {
            const capture = session.current;
            if (!capture) return;
            if (capture.isRecording) {
              if (timer.current) clearTimeout(timer.current);
              await capture.finish();
            } else if (await capture.start()) {
              if (session.current !== capture) return;
              timer.current = setTimeout(() => {
                void run(() => capture.finish());
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

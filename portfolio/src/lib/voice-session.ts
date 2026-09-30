type Recorder = {
  readonly uri: string | null;
  prepareToRecordAsync(): Promise<unknown>;
  record(): unknown;
  stop(): Promise<unknown>;
};
type Dependencies = {
  recorder: Recorder;
  initialUri: string | null;
  permission(): Promise<{ granted: boolean }>;
  recordingMode(enabled: boolean): Promise<unknown>;
  remove(uri: string | null): Promise<void>;
  transcribe(uri: string): Promise<string>;
  onText(text: string): void;
};

// Expo owns the recorder's lifetime. After unmount, even reading a native
// property can throw. Cleanup therefore uses only previously captured values.
export function createVoiceSession(deps: Dependencies) {
  let disposed = false;
  let recording = false;
  let generation = 0;
  let uri = deps.initialUri;
  let finishing: Promise<void> | null = null;

  async function cleanUp(capturedUri: string | null) {
    const results = await Promise.allSettled([deps.remove(capturedUri), deps.recordingMode(false)]);
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected' && !disposed) throw failed.reason;
  }

  return {
    get isRecording() {
      return recording;
    },
    async start() {
      if (disposed || recording || finishing) return false;
      const attempt = ++generation;
      const permission = await deps.permission();
      if (disposed || attempt !== generation) return false;
      if (!permission.granted)
        throw Error('Microphone permission was not granted. You can keep typing.');
      try {
        await deps.recordingMode(true);
        if (disposed || attempt !== generation) {
          await cleanUp(uri);
          return false;
        }
        await deps.recorder.prepareToRecordAsync();
        if (disposed || attempt !== generation) {
          await cleanUp(uri);
          return false;
        }
        uri = deps.recorder.uri;
        deps.recorder.record();
        recording = true;
        return true;
      } catch (error) {
        await cleanUp(uri);
        if (!disposed) throw error;
        return false;
      }
    },
    finish(useRecording = true): Promise<void> {
      if (!useRecording) generation++;
      if (finishing) return finishing;
      if (disposed || !recording) return Promise.resolve();
      recording = false;
      const attempt = generation;
      finishing = (async () => {
        try {
          await deps.recorder.stop();
          if (disposed) return;
          uri = deps.recorder.uri;
          if (useRecording && attempt === generation && uri) {
            const text = await deps.transcribe(uri);
            if (!disposed && attempt === generation) deps.onText(text);
          }
        } finally {
          await cleanUp(uri);
        }
      })().finally(() => {
        finishing = null;
      });
      return finishing;
    },
    dispose() {
      disposed = true;
      recording = false;
      generation++;
      // Expo releases and stops its native object on unmount. Never read it here.
      return cleanUp(uri);
    },
  };
}

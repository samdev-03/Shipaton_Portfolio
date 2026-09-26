import { useEffect, useRef } from 'react';
import { randomUUID } from 'expo-crypto';
import { useSession } from './session';
import { api } from './api';
import { initializeSdk, updateConsent, trackSdk } from './sdk';
export function useFirstStepExperiment() {
  const { user } = useSession(),
    sent = useRef(''),
    id = user?.id,
    a = user?.preferences.analytics,
    p = user?.preferences.notifications;
  useEffect(() => {
    if (!id || !a || sent.current === id) return;
    sent.current = id;
    void api('/v1/events', 'POST', { id: randomUUID(), name: 'experiment_exposed' }).catch(
      () => {},
    );
    void (async () => {
      await initializeSdk(id);
      await updateConsent(true, !!p, id);
      trackSdk('experiment_exposed');
    })().catch(() => {});
  }, [id, a, p]);
  return user?.variant || 'A';
}

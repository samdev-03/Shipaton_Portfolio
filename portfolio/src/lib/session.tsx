import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { api, ApiError, loadSession, saveSession } from './api';
import { initializeSdk, updateConsent, disconnectSdk } from './sdk';
export type User = {
  id: string;
  name: string;
  email: string;
  app: string;
  variant: 'A' | 'B';
  aiEligible: boolean;
  ageBand?: '16_17' | '18_plus';
  preferences: { analytics: boolean; notifications: boolean; ai: boolean };
};
type State = {
  user: User | null;
  entitlement: { active: boolean } | null;
  loading: boolean;
  config: any;
  recoveryCode: string;
  clearRecovery: () => void;
  connectionError: string;
  refresh: () => Promise<void>;
  signIn: (kind: string, data: any) => Promise<void>;
  logout: () => Promise<void>;
  setPreferences: (p: User['preferences']) => Promise<void>;
};
const Context = createContext<State>(null!);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [entitlement, setEntitlement] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [config, setConfig] = useState<any>({}),
    [recoveryCode, setRecoveryCode] = useState(''),
    [connectionError, setConnectionError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const d = await api('/v1/me');
      setUser(d.user);
      setEntitlement(d.entitlement);
      setConnectionError('');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
        setEntitlement(null);
        await saveSession(null);
      } else throw e;
    }
  }, []);
  useEffect(() => {
    void (async () => {
      try {
        await loadSession();
        const r = await Promise.allSettled([api('/v1/config'), refresh()]);
        if (r[0].status === 'fulfilled') setConfig(r[0].value);
        for (const v of r) if (v.status === 'rejected') setConnectionError(v.reason.message);
      } catch (e) {
        setConnectionError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);
  const id = user?.id,
    a = user?.preferences.analytics,
    p = user?.preferences.notifications;
  useEffect(() => {
    if (!id) return;
    void (async () => {
      await initializeSdk(id);
      await updateConsent(!!a, !!p, id);
    })().catch((e) => setConnectionError(e.message));
  }, [id, a, p]);
  async function signIn(kind: string, data: any) {
    const d = await api('/v1/auth/' + kind, 'POST', data);
    await saveSession(d.token || null);
    setUser(d.user);
    if (d.recoveryCode) setRecoveryCode(d.recoveryCode);
    await refresh();
  }
  async function logout() {
    await api('/v1/logout', 'POST', {});
    await saveSession(null);
    try {
      await disconnectSdk();
    } finally {
      setUser(null);
      setEntitlement(null);
      setRecoveryCode('');
    }
  }
  async function setPreferences(preferences: User['preferences']) {
    await api('/v1/preferences', 'PUT', preferences);
    setUser((u) => (u ? { ...u, preferences } : null));
  }
  return (
    <Context.Provider
      value={{
        user,
        entitlement,
        loading,
        config,
        recoveryCode,
        clearRecovery: () => setRecoveryCode(''),
        connectionError,
        refresh,
        signIn,
        logout,
        setPreferences,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);

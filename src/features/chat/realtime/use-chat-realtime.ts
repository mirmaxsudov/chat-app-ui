import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { getCurrentUser } from '@/entities/user';
import {
  AUTH_SESSION_CHANGED,
  AUTH_SESSION_KEY,
  clearAuthSession,
  getAuthSession
} from '@/features/auth';
import { createChatSynchronizer } from './synchronizer';
import { resolveSockJsUrl, startMessageConnection } from './connection';
import { presenceStore } from '../presence/presence-store';

export const useChatRealtime = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    let stopConnection = () => {};
    let synchronizer: ReturnType<typeof createChatSynchronizer> | undefined;
    let activeToken: string | undefined;
    let generation = 0;
    let endingSession = false;
    const disposeRuntime = () => {
      generation++;
      stopConnection();
      stopConnection = () => {};
      synchronizer?.dispose();
      synchronizer = undefined;
      activeToken = undefined;
    };
    const endSession = () => {
      if (disposed || endingSession) return;
      endingSession = true;
      disposeRuntime();
      presenceStore().reset();
      clearAuthSession();
      queryClient.clear();
      void router.navigate({ to: '/login', replace: true });
    };
    const startRuntime = (session: NonNullable<ReturnType<typeof getAuthSession>>) => {
      disposeRuntime();
      activeToken = session.accessToken;
      const runtimeGeneration = generation;
      const isCurrent = () =>
        !disposed &&
        runtimeGeneration === generation &&
        getAuthSession()?.accessToken === session.accessToken;
      synchronizer = createChatSynchronizer(queryClient, isCurrent);
      presenceStore().setConnectionStatus('connecting');
      void import('sockjs-client/dist/sockjs')
        .then(({ default: SockJS }) => {
          if (!isCurrent() || !synchronizer) return;
          const url = resolveSockJsUrl(
            import.meta.env.VITE_API_BASE_URL,
            import.meta.env.VITE_WS_URL,
            window.location.href
          );
          const runtimeSynchronizer = synchronizer;
          stopConnection = startMessageConnection({
            getSession: getAuthSession,
            webSocketFactory: () => new SockJS(url),
            onMessage: runtimeSynchronizer.receive,
            onPresence: (event) => presenceStore().receive(event),
            onConnected: () => runtimeSynchronizer.reconcile(),
            onConnectionStateChange: presenceStore().setConnectionStatus,
            onInvalidSession: () => {
              const latest = getAuthSession();
              if (!latest) endSession();
              else if (latest.accessToken !== activeToken) startRuntime(latest);
              else endSession();
            },
            checkAuthentication: async () => {
              try {
                await getCurrentUser();
                return true;
              } catch (error) {
                if (isAxiosError(error) && [401, 404].includes(error.response?.status ?? 0))
                  return false;
                throw error;
              }
            }
          });
        })
        .catch(() => {
          if (isCurrent()) {
            presenceStore().setConnectionStatus('reconnecting');
            console.warn('Realtime transport unavailable; using REST reconciliation.');
          }
        });
    };
    const checkSession = () => {
      if (disposed) return;
      const latest = getAuthSession();
      if (!latest) endSession();
      else if (latest.accessToken !== activeToken) startRuntime(latest);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_KEY || event.key === null) checkSession();
    };

    const onResume = () => {
      checkSession();
      if (!disposed && getAuthSession()?.accessToken === activeToken && !document.hidden)
        synchronizer?.reconcile(true);
    };
    window.addEventListener(AUTH_SESSION_CHANGED, checkSession);
    window.addEventListener('storage', onStorage);
    window.addEventListener('online', onResume);
    document.addEventListener('visibilitychange', onResume);

    // Best-effort publishing can silently miss an event even on a healthy socket.
    // One active-only safety sweep replaces each query's former 15-second polling.

    const safetyTimer = setInterval(onResume, 60_000);
    const initialSession = getAuthSession();
    if (initialSession) startRuntime(initialSession);
    return () => {
      disposed = true;
      disposeRuntime();
      presenceStore().reset();
      clearInterval(safetyTimer);
      window.removeEventListener(AUTH_SESSION_CHANGED, checkSession);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('online', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, [queryClient, router]);
};

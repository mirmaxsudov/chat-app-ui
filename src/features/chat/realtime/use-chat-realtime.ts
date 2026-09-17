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

export const useChatRealtime = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) return;
    let disposed = false;
    let stopConnection = () => {};
    const isCurrent = () => !disposed && getAuthSession()?.accessToken === session.accessToken;
    const synchronizer = createChatSynchronizer(queryClient, isCurrent);
    const endSession = () => {
      if (disposed) return;
      disposed = true;
      stopConnection();
      synchronizer.dispose();
      clearAuthSession();
      queryClient.clear();
      void router.navigate({ to: '/login', replace: true });
    };

    const checkSession = () => {
      if (!disposed && !isCurrent()) endSession();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_KEY || event.key === null) checkSession();
    };

    const onResume = () => {
      checkSession();
      if (isCurrent() && !document.hidden) synchronizer.reconcile(true);
    };
    window.addEventListener(AUTH_SESSION_CHANGED, checkSession);
    window.addEventListener('storage', onStorage);
    window.addEventListener('online', onResume);
    document.addEventListener('visibilitychange', onResume);

    // Best-effort publishing can silently miss an event even on a healthy socket.
    // One active-only safety sweep replaces each query's former 15-second polling.

    const safetyTimer = setInterval(onResume, 60_000);
    void import('sockjs-client/dist/sockjs')
      .then(({ default: SockJS }) => {
        if (!isCurrent()) return;
        const url = resolveSockJsUrl(
          import.meta.env.VITE_API_BASE_URL,
          import.meta.env.VITE_WS_URL,
          window.location.href
        );
        stopConnection = startMessageConnection({
          getSession: getAuthSession,
          webSocketFactory: () => new SockJS(url),
          onMessage: synchronizer.receive,
          onConnected: () => synchronizer.reconcile(),
          onInvalidSession: endSession,
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
        if (isCurrent()) console.warn('Realtime transport unavailable; using REST reconciliation.');
      });
    return () => {
      disposed = true;
      stopConnection();
      synchronizer.dispose();
      clearInterval(safetyTimer);
      window.removeEventListener(AUTH_SESSION_CHANGED, checkSession);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('online', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, [queryClient, router]);
};

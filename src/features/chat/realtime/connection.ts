import { Client, ReconnectionTimeMode, type StompConfig } from '@stomp/stompjs';
import type { AuthSession } from '@/features/auth/session';
import type { RealtimeMessageEvent, RealtimePresenceEvent } from './event';
import { parseMessageEvent, parsePresenceEvent } from './event';
import type { RealtimeConnectionStatus } from '../presence/presence-store';

export const resolveSockJsUrl = (
  apiUrl: string | undefined,
  explicitUrl: string | undefined,
  pageUrl: string
) => {
  const url = explicitUrl
    ? new URL(explicitUrl, pageUrl)
    : new URL('/ws', new URL(apiUrl || '/api/v1', pageUrl));
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('SockJS requires an HTTP(S) URL');
  return url.href;
};

interface ConnectionOptions {
  getSession: () => AuthSession | null;
  webSocketFactory: NonNullable<StompConfig['webSocketFactory']>;
  onMessage: (event: RealtimeMessageEvent) => void;
  onPresence: (event: RealtimePresenceEvent) => void;
  onConnected: () => void;
  onConnectionStateChange: (status: RealtimeConnectionStatus) => void;
  onInvalidSession: () => void;
  checkAuthentication: () => Promise<boolean>;
  createClient?: (config: StompConfig) => Client;
}

/** STOMP owns reconnect/backoff; private message and presence subscriptions share one client. */
export const startMessageConnection = (options: ConnectionOptions) => {
  const session = options.getSession();
  if (!session) {
    options.onInvalidSession();
    return () => {};
  }
  let stopped = false;
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  let checkingAuthentication = false;
  options.onConnectionStateChange('connecting');
  const validSession = () => {
    const latest = options.getSession();
    return latest?.accessToken === session.accessToken && Date.parse(latest.expiresAt) > Date.now();
  };
  const invalidate = () => {
    if (stopped) return;
    stop();
    options.onInvalidSession();
  };
  const client = (options.createClient ?? ((config) => new Client(config)))({
    webSocketFactory: options.webSocketFactory,
    reconnectDelay: 1_000,
    maxReconnectDelay: 30_000,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    connectionTimeout: 10_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    // Never log protocol frames: CONNECT includes the bearer token.
    debug: () => {},
    beforeConnect: () => {
      if (stopped || !validSession()) {
        invalidate();
        return;
      }
      client.connectHeaders = { Authorization: `Bearer ${options.getSession()!.accessToken}` };
    },
    onConnect: () => {
      if (stopped || !validSession()) {
        invalidate();
        return;
      }
      client.subscribe(
        '/user/queue/messages',
        (frame) => {
          if (stopped || !validSession()) {
            invalidate();
            return;
          }
          const event = parseMessageEvent(frame.body);
          if (event) options.onMessage(event);
        },
        { ack: 'auto' }
      );
      client.subscribe(
        '/user/queue/presence',
        (frame) => {
          if (stopped || !validSession()) {
            invalidate();
            return;
          }
          const event = parsePresenceEvent(frame.body);
          if (event) options.onPresence(event);
        },
        { ack: 'auto' }
      );
      options.onConnectionStateChange('connected');
      options.onConnected();
    },
    // Protocol errors have no stable auth DTO. Verify via REST instead of logging
    // the user out for a broker failure or parsing framework exception strings.
    onStompError: () => {
      if (stopped) return;
      if (!validSession()) {
        invalidate();
        return;
      }
      if (!checkingAuthentication) {
        checkingAuthentication = true;
        void options
          .checkAuthentication()
          .then((authenticated) => {
            if (!stopped && !authenticated) invalidate();
          })
          .catch(() => {
            // A network failure does not prove the login is invalid.
          })
          .finally(() => {
            checkingAuthentication = false;
          });
      }
      options.onConnectionStateChange('reconnecting');
      client.forceDisconnect();
    },
    onWebSocketError: () => {
      if (!stopped) {
        options.onConnectionStateChange('reconnecting');
        client.forceDisconnect();
      }
    },
    onWebSocketClose: () => {
      if (stopped) return;
      if (!validSession()) invalidate();
      else options.onConnectionStateChange('reconnecting');
    }
  });
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(expiryTimer);
    // Force disposal also handles StrictMode cleanup while SockJS is still connecting.
    void client.deactivate({ force: true });
  };
  const checkExpiry = () => {
    if (!validSession()) {
      invalidate();
      return;
    }
    expiryTimer = setTimeout(
      checkExpiry,
      Math.min(2_147_483_647, Math.max(1, Date.parse(session.expiresAt) - Date.now()))
    );
  };
  checkExpiry();
  if (!stopped) client.activate();
  return stop;
};

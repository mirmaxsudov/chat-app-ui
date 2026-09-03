export const AUTH_SESSION_KEY = 'chat_app_auth_session';
export const AUTH_SESSION_CHANGED = 'chat-app:session-changed';
const EXPIRY_SKEW_MS = 30_000;

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
}

const isAuthSession = (value: unknown): value is AuthSession => {
  if (typeof value !== 'object' || value === null) return false;

  return (
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    'expiresAt' in value &&
    typeof value.expiresAt === 'string'
  );
};

export const clearAuthSession = () => {
  const hadSession = localStorage.getItem(AUTH_SESSION_KEY) !== null;
  localStorage.removeItem(AUTH_SESSION_KEY);
  if (hadSession) window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
};

export const saveAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
};

export const getAuthSession = (): AuthSession | null => {
  try {
    const storedValue = localStorage.getItem(AUTH_SESSION_KEY);
    if (!storedValue) return null;

    const session: unknown = JSON.parse(storedValue);
    if (!isAuthSession(session)) {
      clearAuthSession();
      return null;
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt - EXPIRY_SKEW_MS <= Date.now()) {
      clearAuthSession();
      return null;
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
};

import Cookies from 'js-cookie';
import { COOKIES } from '@/shared/constants';

export const AUTH_SESSION_KEY = 'chat_app_auth_session';
export const AUTH_SESSION_CHANGED = 'chat-app:session-changed';

export const setAuthSession = (session: LoginResponsePreview) => {
  Cookies.set(COOKIES.ACCESS_TOKEN, session.accessToken, { expires: new Date(session.expiresAt) });
  Cookies.set(COOKIES.ACCESS_TOKEN_EXPIRED, session.expiresAt);
};

export const clearAuthSession = () => {
  Cookies.remove(COOKIES.ACCESS_TOKEN);
  Cookies.remove(COOKIES.ACCESS_TOKEN_EXPIRED);
};

export const getAccessToken = () => Cookies.get(COOKIES.ACCESS_TOKEN) ?? null;

export const getAccessTokenExpiry = () => Cookies.get(COOKIES.ACCESS_TOKEN_EXPIRED) ?? null;

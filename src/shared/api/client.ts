import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type UnauthorizedHandler = () => void;
type AccessTokenGetter = () => string | null;

let unauthorizedHandler: UnauthorizedHandler | undefined;
let accessTokenGetter: AccessTokenGetter = () => null;

export const setAccessTokenGetter = (getter: AccessTokenGetter) => {
  accessTokenGetter = getter;
};

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const accessToken = accessTokenGetter();

  if (accessToken && config.url !== '/auth/login')
    config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      Boolean(error.config?.headers.Authorization)
    ) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

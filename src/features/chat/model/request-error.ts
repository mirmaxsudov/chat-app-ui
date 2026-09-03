import { getApiErrorBody, getApiErrorMessage } from '@/shared/api/errors';

export const requestErrorMessage = (error: unknown, fallback: string) => {
  const body = getApiErrorBody(error);
  if (typeof body === 'object' && body !== null) {
    for (const field of ['username', 'text', 'message']) {
      const value = (body as Record<string, unknown>)[field];
      if (typeof value === 'string') return value;
    }
  }
  return getApiErrorMessage(error, fallback);
};

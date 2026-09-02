import { isAxiosError } from 'axios';

import type { ApiError, ValidationErrors } from './contractors';

export const isApiError = (value: unknown): value is ApiError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'code' in value &&
    typeof value.code === 'number'
  );
};

export const isValidationErrors = (value: unknown): value is ValidationErrors => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((message) => typeof message === 'string')
  );
};

export const getApiErrorBody = (error: unknown): unknown => {
  return isAxiosError(error) ? error.response?.data : error;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const body = getApiErrorBody(error);

  if (isApiError(body)) return body.message;
  if (error instanceof Error && error.message) return error.message;

  return fallback;
};

import { DEFAULT_CHUNK_SIZE, DEFAULT_RETRY_DELAYS } from './file-upload.utils';

export interface TusUploadConfig {
  chunkSize: number;
  retryDelays: readonly number[];
}

interface TusUploadEnvironment {
  VITE_TUS_UPLOAD_CHUNK_SIZE?: string;
  VITE_TUS_UPLOAD_RETRY_INTERVAL?: string;
}

const parseChunkSize = (value: string | undefined) => {
  const chunkSize = Number(value);
  return Number.isSafeInteger(chunkSize) && chunkSize > 0 ? chunkSize : DEFAULT_CHUNK_SIZE;
};

export const parseRetryIntervals = (value: string | undefined): readonly number[] => {
  if (!value?.trim()) return DEFAULT_RETRY_DELAYS;

  const seconds = value.split(',').map((interval) => Number(interval.trim()));
  if (
    seconds.length === 0 ||
    seconds.some((interval) => !Number.isSafeInteger(interval) || interval < 0)
  )
    return DEFAULT_RETRY_DELAYS;

  return seconds.map((interval) => interval * 1_000);
};

export const resolveTusUploadConfig = (environment: TusUploadEnvironment): TusUploadConfig => ({
  chunkSize: parseChunkSize(environment.VITE_TUS_UPLOAD_CHUNK_SIZE),
  retryDelays: parseRetryIntervals(environment.VITE_TUS_UPLOAD_RETRY_INTERVAL)
});

export const TUS_UPLOAD_CONFIG = resolveTusUploadConfig(import.meta.env);

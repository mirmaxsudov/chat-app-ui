import { FileUploadError } from './file-upload.errors';
import type { FileUploadProgress, TusCapabilities } from './types';

export const TUS_VERSION = '1.0.0';
export const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
export const DEFAULT_RETRY_DELAYS = [0, 1_000, 3_000, 5_000, 10_000] as const;

export const resolveUploadEndpoint = (apiBaseUrl: string | undefined, endpoint?: string) => {
  const configuredEndpoint = endpoint?.trim();
  if (configuredEndpoint) return configuredEndpoint.replace(/\/$/, '');

  const baseUrl = apiBaseUrl?.trim();

  if (!baseUrl) return '/files';

  return `${baseUrl.replace(/\/$/, '')}/files`;
};

export const extractUploadId = (uploadUrl: string) => {
  const baseUrl = typeof window === 'undefined' ? 'http://localhost' : window.location.href;
  const pathname = new URL(uploadUrl, baseUrl).pathname;
  const uploadId = pathname.split('/').filter(Boolean).at(-1);

  if (!uploadId)
    throw new FileUploadError(
      'INVALID_SERVER_RESPONSE',
      'The upload completed without a valid upload ID.'
    );

  return decodeURIComponent(uploadId);
};

export const validateFile = (file: File, maxFileSize: number | null) => {
  if (file.size <= 0) throw new FileUploadError('EMPTY_FILE', 'Empty files are not supported.');

  if (maxFileSize !== null && file.size > maxFileSize)
    throw new FileUploadError(
      'FILE_TOO_LARGE',
      `The selected file exceeds the maximum upload size of ${maxFileSize} bytes.`
    );
};

export const parseTusCapabilities = (headers: Headers): TusCapabilities => {
  const maxSizeHeader = headers.get('Tus-Max-Size');
  const parsedMaxSize = maxSizeHeader === null ? Number.NaN : Number(maxSizeHeader);

  return {
    extensions: (headers.get('Tus-Extension') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    maxFileSize: Number.isSafeInteger(parsedMaxSize) && parsedMaxSize > 0 ? parsedMaxSize : null,
    versions: (headers.get('Tus-Version') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  };
};

export const calculateProgress = (
  bytesUploaded: number,
  bytesTotal: number,
  startedAt: number,
  now = performance.now()
): FileUploadProgress => {
  const elapsedSeconds = Math.max((now - startedAt) / 1_000, 0);
  const bytesPerSecond = elapsedSeconds > 0 ? bytesUploaded / elapsedSeconds : 0;
  const bytesRemaining = Math.max(bytesTotal - bytesUploaded, 0);

  return {
    bytesPerSecond,
    bytesTotal,
    bytesUploaded,
    estimatedSecondsRemaining: bytesPerSecond > 0 ? bytesRemaining / bytesPerSecond : null,
    percentage: bytesTotal > 0 ? Math.min((bytesUploaded / bytesTotal) * 100, 100) : 0
  };
};

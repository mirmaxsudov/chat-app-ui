import type { MultipleFileUploadItem, MultipleFileUploadSummary } from './types';

export const DEFAULT_UPLOAD_CONCURRENCY = 3;

export const normalizeUploadConcurrency = (concurrency: number | undefined) =>
  Number.isSafeInteger(concurrency) && (concurrency ?? 0) > 0
    ? (concurrency as number)
    : DEFAULT_UPLOAD_CONCURRENCY;

export const getFileIdentity = (file: File) =>
  [file.name, file.size, file.type, file.lastModified].join(':');

export const calculateMultipleUploadSummary = (
  items: readonly MultipleFileUploadItem[]
): MultipleFileUploadSummary => {
  const totalCount = items.length;
  const queuedCount = items.filter((item) => item.status === 'queued').length;
  const uploadingCount = items.filter((item) =>
    ['validating', 'uploading'].includes(item.status)
  ).length;
  const pausedCount = items.filter((item) => item.status === 'paused').length;
  const successCount = items.filter((item) => item.status === 'success').length;
  const errorCount = items.filter((item) => item.status === 'error').length;
  const cancelledCount = items.filter((item) => item.status === 'cancelled').length;
  const completedCount = successCount + errorCount + cancelledCount;
  const bytesTotal = items.reduce((total, item) => total + item.bytesTotal, 0);
  const bytesUploaded = items.reduce((total, item) => total + item.bytesUploaded, 0);
  const bytesPerSecond = items
    .filter((item) => item.status === 'uploading')
    .reduce((total, item) => total + item.bytesPerSecond, 0);
  const bytesRemaining = Math.max(bytesTotal - bytesUploaded, 0);

  let status: MultipleFileUploadSummary['status'] = 'idle';
  if (totalCount > 0) {
    if (queuedCount > 0 || uploadingCount > 0) status = 'uploading';
    else if (pausedCount > 0) status = 'paused';
    else if (successCount === totalCount) status = 'success';
    else if (successCount > 0) status = 'partial-success';
    else if (errorCount > 0) status = 'error';
    else status = 'cancelled';
  }

  return {
    bytesPerSecond,
    bytesTotal,
    bytesUploaded,
    cancelledCount,
    completedCount,
    errorCount,
    estimatedSecondsRemaining: bytesPerSecond > 0 ? bytesRemaining / bytesPerSecond : null,
    pausedCount,
    percentage: bytesTotal > 0 ? Math.min((bytesUploaded / bytesTotal) * 100, 100) : 0,
    queuedCount,
    status,
    successCount,
    totalCount,
    uploadingCount
  };
};

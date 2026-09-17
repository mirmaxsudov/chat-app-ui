import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileUploadError } from './file-upload.errors';
import { calculateProgress, resolveUploadEndpoint, validateFile } from './file-upload.utils';
import type { FileUploadTask } from './tus-upload.service';
import { TusFileUploadService } from './tus-upload.service';
import type {
  FileUploadProgress,
  FileUploadResult,
  FileUploadStatus,
  StartFileUploadOptions,
  TusCapabilities,
  UseFileUploadOptions,
  UseFileUploadResult
} from './types';

const EMPTY_PROGRESS: FileUploadProgress = {
  bytesPerSecond: 0,
  bytesTotal: 0,
  bytesUploaded: 0,
  estimatedSecondsRemaining: null,
  percentage: 0
};

const service = new TusFileUploadService();

export const useFileUpload = (options: UseFileUploadOptions): UseFileUploadResult => {
  const endpoint = resolveUploadEndpoint(import.meta.env.VITE_API_BASE_URL, options.endpoint);
  const optionsRef = useRef(options);

  const taskRef = useRef<FileUploadTask | null>(null);
  const activeRunRef = useRef(false);
  const runIdRef = useRef(0);
  const startedAtRef = useRef(0);
  const [status, setStatus] = useState<FileUploadStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<FileUploadProgress>(EMPTY_PROGRESS);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<FileUploadResult | null>(null);
  const [uploadLocation, setUploadLocation] = useState<{
    uploadId: string;
    uploadUrl: string;
  } | null>(null);
  const [capabilities, setCapabilities] = useState<TusCapabilities | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const discoverCapabilities = useCallback(async () => {
    const discovered = await service.discoverCapabilities(endpoint);
    setCapabilities(discovered);
    return discovered;
  }, [endpoint]);

  const resetState = useCallback(() => {
    setStatus('idle');
    setFile(null);
    setProgress(EMPTY_PROGRESS);
    setError(null);
    setResult(null);
    setUploadLocation(null);
  }, []);

  const startUpload = useCallback(
    async (selectedFile: File, startOptions?: StartFileUploadOptions) => {
      if (activeRunRef.current)
        throw new FileUploadError(
          'UPLOAD_IN_PROGRESS',
          'Finish, cancel, or reset the current upload before starting another one.'
        );

      activeRunRef.current = true;
      const runId = ++runIdRef.current;
      setStatus('validating');
      setFile(selectedFile);
      setProgress({ ...EMPTY_PROGRESS, bytesTotal: selectedFile.size });
      setError(null);
      setResult(null);
      setUploadLocation(null);

      try {
        const activeOptions = optionsRef.current;
        const discovered =
          activeOptions.discoverServerCapabilities === false
            ? null
            : (capabilities ?? (await discoverCapabilities()));
        const maxFileSize = activeOptions.maxFileSize ?? discovered?.maxFileSize ?? null;
        validateFile(selectedFile, maxFileSize);
        startedAtRef.current = performance.now();

        const task = service.createTask({
          autoResume: activeOptions.autoResume,
          chunkSize: activeOptions.chunkSize,
          endpoint,
          file: selectedFile,
          getAccessToken: activeOptions.getAccessToken,
          metadata: startOptions?.metadata,
          onUnauthorized: activeOptions.onUnauthorized,
          retryDelays: activeOptions.retryDelays,
          onUploadUrlAvailable: (uploadUrl, uploadId) => {
            if (runId === runIdRef.current) setUploadLocation({ uploadId, uploadUrl });
          },
          onProgress: ({ bytesUploaded, bytesTotal }) => {
            if (runId !== runIdRef.current) return;
            setProgress(calculateProgress(bytesUploaded, bytesTotal, startedAtRef.current));
          }
        });
        taskRef.current = task;
        setStatus('uploading');
        const uploadResult = await task.start();

        if (runId === runIdRef.current) {
          activeRunRef.current = false;
          taskRef.current = null;
          setProgress((current) => ({
            ...current,
            bytesUploaded: selectedFile.size,
            bytesTotal: selectedFile.size,
            estimatedSecondsRemaining: 0,
            percentage: 100
          }));
          setResult(uploadResult);
          setUploadLocation({
            uploadId: uploadResult.uploadId,
            uploadUrl: uploadResult.uploadUrl
          });
          setStatus('success');
          activeOptions.onSuccess?.(uploadResult);
        }

        return uploadResult;
      } catch (caughtError) {
        const uploadError =
          caughtError instanceof Error ? caughtError : new Error(String(caughtError));
        if (runId === runIdRef.current) {
          activeRunRef.current = false;
          taskRef.current = null;
          setError(uploadError);
          setStatus(
            uploadError instanceof FileUploadError && uploadError.code === 'CANCELLED'
              ? 'cancelled'
              : 'error'
          );
          optionsRef.current.onError?.(uploadError);
        }
        throw uploadError;
      }
    },
    [capabilities, discoverCapabilities, endpoint]
  );

  const pauseUpload = useCallback(async () => {
    const task = taskRef.current;
    if (!task || status !== 'uploading') return;
    await task.pause();
    setStatus('paused');
  }, [status]);

  const resumeUpload = useCallback(() => {
    const task = taskRef.current;
    if (!task || status !== 'paused') return;
    startedAtRef.current = performance.now();
    task.resume();
    setStatus('uploading');
  }, [status]);

  const cancelUpload = useCallback(async () => {
    await taskRef.current?.cancel();
  }, []);

  const reset = useCallback(async () => {
    const task = taskRef.current;
    ++runIdRef.current;
    activeRunRef.current = false;
    taskRef.current = null;
    if (task) await task.dispose();
    resetState();
  }, [resetState]);

  useEffect(
    () => () => {
      ++runIdRef.current;
      activeRunRef.current = false;
      const task = taskRef.current;
      taskRef.current = null;
      if (task) void task.dispose();
    },
    []
  );

  return useMemo(
    () => ({
      attachmentId: result?.attachmentId ?? null,
      ...progress,
      canCancel: status === 'uploading' || status === 'paused',
      canPause: status === 'uploading',
      canResume: status === 'paused',
      cancelUpload,
      capabilities,
      discoverCapabilities,
      error,
      file,
      isCancelled: status === 'cancelled',
      isError: status === 'error',
      isIdle: status === 'idle',
      isPaused: status === 'paused',
      isSuccess: status === 'success',
      isUploading: status === 'validating' || status === 'uploading',
      maxFileSize: options.maxFileSize ?? capabilities?.maxFileSize ?? null,
      pauseUpload,
      reset,
      result,
      resumeUpload,
      startUpload,
      status,
      uploadId: uploadLocation?.uploadId ?? null,
      uploadUrl: uploadLocation?.uploadUrl ?? null
    }),
    [
      cancelUpload,
      capabilities,
      discoverCapabilities,
      error,
      file,
      options.maxFileSize,
      pauseUpload,
      progress,
      reset,
      result,
      resumeUpload,
      startUpload,
      status,
      uploadLocation
    ]
  );
};

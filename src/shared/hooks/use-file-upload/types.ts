export type FileUploadStatus =
  | 'cancelled'
  | 'error'
  | 'idle'
  | 'paused'
  | 'success'
  | 'uploading'
  | 'validating';

export interface TusCapabilities {
  extensions: string[];
  maxFileSize: number | null;
  versions: string[];
}

export interface FileUploadProgress {
  bytesPerSecond: number;
  bytesTotal: number;
  bytesUploaded: number;
  estimatedSecondsRemaining: number | null;
  percentage: number;
}

export interface FileUploadResult {
  attachmentId: string | null;
  file: File;
  uploadId: string;
  uploadUrl: string;
}

export interface StartFileUploadOptions {
  metadata?: Record<string, string>;
}

export interface UseFileUploadOptions {
  autoResume?: boolean;
  chunkSize?: number;
  discoverServerCapabilities?: boolean;
  endpoint?: string;
  maxFileSize?: number;
  retryDelays?: readonly number[];
  getAccessToken: () => string | null;
  onError?: (error: Error) => void;
  onSuccess?: (result: FileUploadResult) => void;
  onUnauthorized?: () => void;
}

export interface UseFileUploadResult {
  attachmentId: string | null;
  bytesPerSecond: number;
  bytesTotal: number;
  bytesUploaded: number;
  canCancel: boolean;
  canPause: boolean;
  canResume: boolean;
  capabilities: TusCapabilities | null;
  error: Error | null;
  estimatedSecondsRemaining: number | null;
  file: File | null;
  isCancelled: boolean;
  isError: boolean;
  isIdle: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  isUploading: boolean;
  maxFileSize: number | null;
  percentage: number;
  result: FileUploadResult | null;
  status: FileUploadStatus;
  uploadId: string | null;
  uploadUrl: string | null;
  cancelUpload: () => Promise<void>;
  discoverCapabilities: () => Promise<TusCapabilities>;
  pauseUpload: () => Promise<void>;
  reset: () => Promise<void>;
  resumeUpload: () => void;
  startUpload: (file: File, options?: StartFileUploadOptions) => Promise<FileUploadResult>;
}

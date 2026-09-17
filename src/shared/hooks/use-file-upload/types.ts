export type FileUploadStatus =
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'paused'
  | 'success'
  | 'error'
  | 'cancelled';

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
  getAccessToken: () => string | null;
  maxFileSize?: number;
  onError?: (error: Error) => void;
  onSuccess?: (result: FileUploadResult) => void;
  onUnauthorized?: () => void;
  retryDelays?: readonly number[];
}

export interface UseFileUploadResult {
  attachmentId: string | null;
  bytesPerSecond: number;
  bytesTotal: number;
  bytesUploaded: number;
  canCancel: boolean;
  canPause: boolean;
  canResume: boolean;
  cancelUpload: () => Promise<void>;
  capabilities: TusCapabilities | null;
  discoverCapabilities: () => Promise<TusCapabilities>;
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
  pauseUpload: () => Promise<void>;
  percentage: number;
  reset: () => Promise<void>;
  result: FileUploadResult | null;
  resumeUpload: () => void;
  startUpload: (file: File, options?: StartFileUploadOptions) => Promise<FileUploadResult>;
  status: FileUploadStatus;
  uploadId: string | null;
  uploadUrl: string | null;
}

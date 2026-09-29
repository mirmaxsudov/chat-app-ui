import type {
  FileUploadProgress,
  FileUploadResult,
  StartFileUploadOptions,
  TusCapabilities
} from '../use-file-upload';

export type MultipleFileUploadItemStatus =
  'cancelled' | 'error' | 'paused' | 'pending' | 'queued' | 'success' | 'uploading' | 'validating';

export type MultipleFileUploadStatus =
  | 'cancelled'
  | 'error'
  | 'idle'
  | 'partial-success'
  | 'paused'
  | 'pending'
  | 'success'
  | 'uploading';

export interface MultipleFileUploadItem extends FileUploadProgress {
  attachmentId: string | null;
  error: Error | null;
  file: File;
  id: string;
  result: FileUploadResult | null;
  status: MultipleFileUploadItemStatus;
  uploadId: string | null;
  uploadUrl: string | null;
}

export interface MultipleFileUploadSummary extends FileUploadProgress {
  cancelledCount: number;
  completedCount: number;
  errorCount: number;
  pausedCount: number;
  pendingCount: number;
  queuedCount: number;
  status: MultipleFileUploadStatus;
  successCount: number;
  totalCount: number;
  uploadingCount: number;
}

export interface AddFilesOptions extends StartFileUploadOptions {
  getMetadata?: (file: File) => Record<string, string>;
}

export interface UseMultipleFileUploadOptions {
  autoResume?: boolean;
  autoStart?: boolean;
  chunkSize?: number;
  concurrency?: number;
  discoverServerCapabilities?: boolean;
  endpoint?: string;
  maxFileSize?: number;
  retryDelays?: readonly number[];
  getAccessToken: () => string | null;
  onUnauthorized?: () => void;
}

export interface UseMultipleFileUploadResult extends MultipleFileUploadSummary {
  capabilities: TusCapabilities | null;
  items: MultipleFileUploadItem[];
  addFiles: (files: Iterable<File>, options?: AddFilesOptions) => string[];
  cancelAll: () => Promise<void>;
  cancelUpload: (id: string) => Promise<void>;
  discoverCapabilities: () => Promise<TusCapabilities>;
  pauseAll: () => Promise<void>;
  pauseUpload: (id: string) => Promise<void>;
  removeUpload: (id: string) => Promise<void>;
  reset: () => Promise<void>;
  resumeAll: () => void;
  resumeUpload: (id: string) => void;
  retryFailed: () => void;
  retryUpload: (id: string) => void;
  startAll: () => Promise<MultipleFileUploadItem[]>;
  waitForAll: () => Promise<MultipleFileUploadSummary>;
}

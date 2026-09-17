import type {
  FileUploadProgress,
  FileUploadResult,
  StartFileUploadOptions,
  TusCapabilities
} from '../use-file-upload';

export type MultipleFileUploadItemStatus =
  'pending' | 'queued' | 'validating' | 'uploading' | 'paused' | 'success' | 'error' | 'cancelled';

export type MultipleFileUploadStatus =
  | 'idle'
  | 'pending'
  | 'uploading'
  | 'paused'
  | 'success'
  | 'partial-success'
  | 'error'
  | 'cancelled';

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
  autoStart?: boolean;
  autoResume?: boolean;
  chunkSize?: number;
  concurrency?: number;
  discoverServerCapabilities?: boolean;
  endpoint?: string;
  getAccessToken: () => string | null;
  maxFileSize?: number;
  onUnauthorized?: () => void;
  retryDelays?: readonly number[];
}

export interface UseMultipleFileUploadResult extends MultipleFileUploadSummary {
  addFiles: (files: Iterable<File>, options?: AddFilesOptions) => string[];
  cancelAll: () => Promise<void>;
  cancelUpload: (id: string) => Promise<void>;
  capabilities: TusCapabilities | null;
  discoverCapabilities: () => Promise<TusCapabilities>;
  items: MultipleFileUploadItem[];
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

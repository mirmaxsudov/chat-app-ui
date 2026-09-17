import * as tus from 'tus-js-client';
import { TUS_UPLOAD_CONFIG } from './file-upload.config';
import { FileUploadError } from './file-upload.errors';
import { TUS_VERSION, extractUploadId, parseTusCapabilities } from './file-upload.utils';
import type { FileUploadProgress, FileUploadResult, TusCapabilities } from './types';

export interface TusUploadTaskOptions {
  autoResume?: boolean;
  chunkSize?: number;
  endpoint: string;
  file: File;
  getAccessToken: () => string | null;
  metadata?: Record<string, string>;
  onProgress?: (progress: Pick<FileUploadProgress, 'bytesTotal' | 'bytesUploaded'>) => void;
  onUploadUrlAvailable?: (uploadUrl: string, uploadId: string) => void;
  onUnauthorized?: () => void;
  retryDelays?: readonly number[];
}

export interface FileUploadTask {
  cancel(): Promise<void>;
  dispose(): Promise<void>;
  pause(): Promise<void>;
  resume(): void;
  start(): Promise<FileUploadResult>;
}

export interface FileUploadService {
  createTask(options: TusUploadTaskOptions): FileUploadTask;
  discoverCapabilities(endpoint: string): Promise<TusCapabilities>;
}

const requireAccessToken = (getAccessToken: () => string | null) => {
  const accessToken = getAccessToken();
  if (!accessToken)
    throw new FileUploadError('AUTH_REQUIRED', 'Authentication is required to upload a file.');
  return accessToken;
};

class TusUploadTask implements FileUploadTask {
  private readonly upload: tus.Upload;
  private attachmentId: string | null = null;
  private cancelled = false;
  private settled = false;
  private resolveCompletion!: (result: FileUploadResult) => void;
  private rejectCompletion!: (error: Error) => void;
  private readonly completion: Promise<FileUploadResult>;

  constructor(private readonly taskOptions: TusUploadTaskOptions) {
    this.completion = new Promise<FileUploadResult>((resolve, reject) => {
      this.resolveCompletion = resolve;
      this.rejectCompletion = reject;
    });

    this.upload = new tus.Upload(taskOptions.file, {
      endpoint: taskOptions.endpoint,
      chunkSize: taskOptions.chunkSize ?? TUS_UPLOAD_CONFIG.chunkSize,
      retryDelays: [...(taskOptions.retryDelays ?? TUS_UPLOAD_CONFIG.retryDelays)],
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: taskOptions.file.name,
        contentType: taskOptions.file.type || 'application/octet-stream',
        ...taskOptions.metadata
      },
      onBeforeRequest: (request) => {
        request.setHeader(
          'Authorization',
          `Bearer ${requireAccessToken(taskOptions.getAccessToken)}`
        );
      },
      onAfterResponse: (_request, response) => {
        if (response.getStatus() === 401) taskOptions.onUnauthorized?.();
        this.attachmentId = response.getHeader('Upload-Attachment-Id') ?? this.attachmentId;
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        taskOptions.onProgress?.({ bytesUploaded, bytesTotal });
      },
      onUploadUrlAvailable: () => {
        const uploadUrl = this.upload.url;
        if (uploadUrl) taskOptions.onUploadUrlAvailable?.(uploadUrl, extractUploadId(uploadUrl));
      },
      onError: (error) => this.reject(error),
      onSuccess: ({ lastResponse }) => {
        const uploadUrl = this.upload.url;
        if (!uploadUrl) {
          this.reject(
            new FileUploadError(
              'INVALID_SERVER_RESPONSE',
              'The upload completed without an upload URL.'
            )
          );
          return;
        }

        this.attachmentId = lastResponse.getHeader('Upload-Attachment-Id') ?? this.attachmentId;
        this.settled = true;
        this.resolveCompletion({
          attachmentId: this.attachmentId,
          file: taskOptions.file,
          uploadId: extractUploadId(uploadUrl),
          uploadUrl
        });
      }
    });
  }

  async start() {
    requireAccessToken(this.taskOptions.getAccessToken);

    if (this.taskOptions.autoResume !== false) {
      const previousUploads = await this.upload.findPreviousUploads();
      if (this.cancelled) return this.completion;
      if (previousUploads[0]) this.upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    this.upload.start();
    return this.completion;
  }

  async pause() {
    if (!this.settled) await this.upload.abort();
  }

  resume() {
    if (!this.cancelled && !this.settled) this.upload.start();
  }

  async cancel() {
    if (this.settled || this.cancelled) return;
    this.cancelled = true;

    try {
      await this.upload.abort(true);
    } finally {
      this.reject(new FileUploadError('CANCELLED', 'The file upload was permanently cancelled.'));
    }
  }

  async dispose() {
    if (this.settled) return;
    this.cancelled = true;

    try {
      await this.upload.abort();
    } finally {
      this.reject(new FileUploadError('CANCELLED', 'The file upload was stopped locally.'));
    }
  }

  private reject(error: Error) {
    if (this.settled) return;
    this.settled = true;
    this.rejectCompletion(error);
  }
}

export class TusFileUploadService implements FileUploadService {
  createTask(options: TusUploadTaskOptions) {
    return new TusUploadTask(options);
  }

  async discoverCapabilities(endpoint: string) {
    const response = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: { 'Tus-Resumable': TUS_VERSION }
    });

    if (!response.ok)
      throw new Error(`Could not discover upload capabilities (HTTP ${response.status}).`);

    const capabilities = parseTusCapabilities(response.headers);
    if (capabilities.versions.length > 0 && !capabilities.versions.includes(TUS_VERSION))
      throw new Error(`The upload server does not support TUS ${TUS_VERSION}.`);

    return capabilities;
  }
}

import {
  FileUploadError,
  TusFileUploadService,
  calculateProgress,
  validateFile
} from '../use-file-upload';
import type { FileUploadService, FileUploadTask, TusCapabilities } from '../use-file-upload';
import {
  calculateMultipleUploadSummary,
  getFileIdentity,
  normalizeUploadConcurrency
} from './multiple-file-upload.utils';
import type {
  AddFilesOptions,
  MultipleFileUploadItem,
  MultipleFileUploadSummary,
  UseMultipleFileUploadOptions
} from './types';

interface ResolvedControllerOptions extends UseMultipleFileUploadOptions {
  endpoint: string;
}

interface InternalUploadItem extends MultipleFileUploadItem {
  metadata?: Record<string, string>;
  runId: number;
  slotActive: boolean;
  startedAt: number;
  task: FileUploadTask | null;
}

interface ControllerSnapshot {
  capabilities: TusCapabilities | null;
  items: MultipleFileUploadItem[];
  summary: MultipleFileUploadSummary;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const toPublicItem = (item: InternalUploadItem): MultipleFileUploadItem => ({
  attachmentId: item.attachmentId,
  bytesPerSecond: item.bytesPerSecond,
  bytesTotal: item.bytesTotal,
  bytesUploaded: item.bytesUploaded,
  error: item.error,
  estimatedSecondsRemaining: item.estimatedSecondsRemaining,
  file: item.file,
  id: item.id,
  percentage: item.percentage,
  result: item.result,
  status: item.status,
  uploadId: item.uploadId,
  uploadUrl: item.uploadUrl
});

export class MultipleFileUploadController {
  private readonly items = new Map<string, InternalUploadItem>();
  private readonly listeners = new Set<() => void>();
  private readonly waiters = new Set<(summary: MultipleFileUploadSummary) => void>();
  private activeCount = 0;
  private capabilities: TusCapabilities | null = null;
  private capabilitiesPromise: Promise<TusCapabilities> | null = null;
  private disposed = false;
  private snapshot: ControllerSnapshot = {
    capabilities: null,
    items: [],
    summary: calculateMultipleUploadSummary([])
  };

  constructor(
    private options: ResolvedControllerOptions,
    private readonly service: FileUploadService = new TusFileUploadService()
  ) {}

  setOptions(options: ResolvedControllerOptions) {
    if (options.endpoint !== this.options.endpoint) {
      this.capabilities = null;
      this.capabilitiesPromise = null;
    }
    this.options = options;
    this.publish();
    this.drain();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  addFiles(files: Iterable<File>, options?: AddFilesOptions) {
    const ids: string[] = [];
    const existingIdentities = new Map(
      [...this.items.values()]
        .filter((item) => !['success', 'error', 'cancelled'].includes(item.status))
        .map((item) => [getFileIdentity(item.file), item.id])
    );

    for (const file of files) {
      const identity = getFileIdentity(file);
      const existingId = existingIdentities.get(identity);
      if (existingId) {
        ids.push(existingId);
        continue;
      }

      const id = createId();
      const item: InternalUploadItem = {
        attachmentId: null,
        bytesPerSecond: 0,
        bytesTotal: file.size,
        bytesUploaded: 0,
        error: null,
        estimatedSecondsRemaining: null,
        file,
        id,
        metadata: options?.getMetadata?.(file) ?? options?.metadata,
        percentage: 0,
        result: null,
        runId: 0,
        slotActive: false,
        startedAt: 0,
        status: this.options.autoStart === false ? 'pending' : 'queued',
        task: null,
        uploadId: null,
        uploadUrl: null
      };
      this.items.set(id, item);
      existingIdentities.set(identity, id);
      ids.push(id);
    }

    this.publish();
    this.drain();
    return ids;
  }

  async discoverCapabilities() {
    if (this.capabilities) return this.capabilities;
    if (this.capabilitiesPromise) return this.capabilitiesPromise;

    this.capabilitiesPromise = this.service
      .discoverCapabilities(this.options.endpoint)
      .then((capabilities) => {
        this.capabilities = capabilities;
        this.publish();
        return capabilities;
      })
      .finally(() => {
        this.capabilitiesPromise = null;
      });
    return this.capabilitiesPromise;
  }

  async pauseUpload(id: string) {
    const item = this.items.get(id);
    if (!item) return;

    if (item.status === 'queued') {
      item.status = 'paused';
      this.publish();
      return;
    }

    if (item.status === 'validating') {
      item.runId += 1;
      item.status = 'paused';
      this.releaseSlot(item);
      return;
    }

    if (item.status !== 'uploading' || !item.task) return;
    await item.task.pause();
    if (item.status !== 'uploading') return;
    item.status = 'paused';
    this.releaseSlot(item);
  }

  resumeUpload(id: string) {
    const item = this.items.get(id);
    if (!item || item.status !== 'paused') return;
    item.status = this.options.autoStart === false ? 'pending' : 'queued';
    this.publish();
    this.drain();
  }

  async startAll() {
    for (const item of this.items.values()) {
      if (item.status === 'pending') item.status = 'queued';
    }
    this.publish();
    this.drain();
    await this.waitForAll();
    return this.snapshot.items;
  }

  retryUpload(id: string) {
    const item = this.items.get(id);
    if (!item || item.status !== 'error') return;
    item.runId += 1;
    item.task = null;
    item.error = null;
    item.result = null;
    item.attachmentId = null;
    item.uploadId = null;
    item.uploadUrl = null;
    item.bytesUploaded = 0;
    item.bytesPerSecond = 0;
    item.estimatedSecondsRemaining = null;
    item.percentage = 0;
    item.status = this.options.autoStart === false ? 'pending' : 'queued';
    this.publish();
    this.drain();
  }

  async cancelUpload(id: string) {
    const item = this.items.get(id);
    if (!item || ['success', 'cancelled'].includes(item.status)) return;
    const task = item.task;
    item.runId += 1;
    item.status = 'cancelled';
    item.task = null;
    this.releaseSlot(item);
    this.publish();
    if (task) await task.cancel();
  }

  async removeUpload(id: string) {
    await this.cancelUpload(id);
    this.items.delete(id);
    this.publish();
  }

  async pauseAll() {
    await Promise.all([...this.items.keys()].map((id) => this.pauseUpload(id)));
  }

  resumeAll() {
    for (const item of this.items.values()) {
      if (item.status === 'paused') item.status = 'queued';
    }
    this.publish();
    this.drain();
  }

  retryFailed() {
    for (const item of this.items.values()) this.retryUpload(item.id);
  }

  async cancelAll() {
    await Promise.all([...this.items.keys()].map((id) => this.cancelUpload(id)));
  }

  async reset() {
    const tasks = [...this.items.values()].flatMap((item) => {
      item.runId += 1;
      return item.task ? [item.task] : [];
    });
    this.activeCount = 0;
    this.items.clear();
    this.publish();
    await Promise.all(tasks.map((task) => task.dispose()));
  }

  waitForAll() {
    if (this.isSettled()) return Promise.resolve(this.snapshot.summary);
    return new Promise<MultipleFileUploadSummary>((resolve) => this.waiters.add(resolve));
  }

  dispose() {
    this.disposed = true;
    this.listeners.clear();
    const tasks = [...this.items.values()].flatMap((item) => {
      item.runId += 1;
      return item.task ? [item.task] : [];
    });
    this.items.clear();
    this.activeCount = 0;
    for (const task of tasks) void task.dispose();
  }

  private drain() {
    if (this.disposed) return;
    const concurrency = normalizeUploadConcurrency(this.options.concurrency);
    while (this.activeCount < concurrency) {
      const item = [...this.items.values()].find((candidate) => candidate.status === 'queued');
      if (!item) return;
      void this.runItem(item);
    }
  }

  private async runItem(item: InternalUploadItem) {
    item.slotActive = true;
    this.activeCount += 1;

    if (item.task) {
      item.status = 'uploading';
      item.startedAt = performance.now();
      item.task.resume();
      this.publish();
      return;
    }

    const runId = ++item.runId;
    item.status = 'validating';
    this.publish();

    try {
      const options = this.options;
      const capabilities =
        options.discoverServerCapabilities === false
          ? null
          : (this.capabilities ?? (await this.discoverCapabilities()));
      if (!this.isCurrent(item, runId)) return;

      validateFile(item.file, options.maxFileSize ?? capabilities?.maxFileSize ?? null);
      item.startedAt = performance.now();
      item.task = this.service.createTask({
        autoResume: options.autoResume,
        chunkSize: options.chunkSize,
        endpoint: options.endpoint,
        file: item.file,
        getAccessToken: options.getAccessToken,
        metadata: item.metadata,
        onUnauthorized: options.onUnauthorized,
        retryDelays: options.retryDelays,
        onUploadUrlAvailable: (uploadUrl, uploadId) => {
          if (!this.isCurrent(item, runId)) return;
          item.uploadId = uploadId;
          item.uploadUrl = uploadUrl;
          this.publish();
        },
        onProgress: ({ bytesUploaded, bytesTotal }) => {
          if (!this.isCurrent(item, runId)) return;
          Object.assign(item, calculateProgress(bytesUploaded, bytesTotal, item.startedAt));
          this.publish();
        }
      });
      item.status = 'uploading';
      this.publish();
      const result = await item.task.start();
      if (!this.isCurrent(item, runId)) return;

      item.result = result;
      item.attachmentId = result.attachmentId;
      item.uploadId = result.uploadId;
      item.uploadUrl = result.uploadUrl;
      item.bytesUploaded = item.file.size;
      item.bytesTotal = item.file.size;
      item.estimatedSecondsRemaining = 0;
      item.percentage = 100;
      item.status = 'success';
      item.task = null;
      this.publish();
    } catch (caughtError) {
      if (!this.isCurrent(item, runId)) return;
      const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      item.error = error;
      item.status =
        error instanceof FileUploadError && error.code === 'CANCELLED' ? 'cancelled' : 'error';
      item.task = null;
      this.publish();
    } finally {
      this.releaseSlot(item);
    }
  }

  private isCurrent(item: InternalUploadItem, runId: number) {
    return !this.disposed && item.runId === runId && this.items.get(item.id) === item;
  }

  private releaseSlot(item: InternalUploadItem) {
    if (!item.slotActive) return;
    item.slotActive = false;
    this.activeCount = Math.max(this.activeCount - 1, 0);
    this.publish();
    this.drain();
  }

  private isSettled() {
    return (
      this.items.size === 0 ||
      [...this.items.values()].every((item) =>
        ['success', 'error', 'cancelled'].includes(item.status)
      )
    );
  }

  private publish() {
    if (this.disposed) return;
    const publicItems = [...this.items.values()].map(toPublicItem);
    const summary = calculateMultipleUploadSummary(publicItems);
    this.snapshot = { capabilities: this.capabilities, items: publicItems, summary };
    for (const listener of this.listeners) listener();

    if (this.isSettled() && this.waiters.size > 0) {
      for (const resolve of this.waiters) resolve(summary);
      this.waiters.clear();
    }
  }
}

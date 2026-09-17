import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const loadUtilities = async (t) => {
  const server = await createServer({
    configFile: false,
    resolve: { alias: { '@': resolve('src') } },
    server: { middlewareMode: true, ws: false },
    appType: 'custom'
  });
  t.after(() => server.close());
  return server.ssrLoadModule(
    '/src/shared/hooks/use-multiple-file-upload/multiple-file-upload.utils.ts'
  );
};

const item = (status, uploaded, total, speed = 0) => ({
  attachmentId: null,
  bytesPerSecond: speed,
  bytesTotal: total,
  bytesUploaded: uploaded,
  error: null,
  estimatedSecondsRemaining: null,
  file: {},
  id: status,
  percentage: total > 0 ? (uploaded / total) * 100 : 0,
  result: null,
  status,
  uploadId: null,
  uploadUrl: null
});

test('multiple upload summary combines file progress and active throughput', async (t) => {
  const { calculateMultipleUploadSummary } = await loadUtilities(t);
  const summary = calculateMultipleUploadSummary([
    item('success', 100, 100),
    item('uploading', 50, 100, 25),
    item('queued', 0, 100)
  ]);

  assert.equal(summary.status, 'uploading');
  assert.equal(summary.percentage, 50);
  assert.equal(summary.bytesPerSecond, 25);
  assert.equal(summary.estimatedSecondsRemaining, 6);
  assert.equal(summary.successCount, 1);
  assert.equal(summary.uploadingCount, 1);
  assert.equal(summary.queuedCount, 1);
});

test('multiple upload summary distinguishes success, partial success, and failure', async (t) => {
  const { calculateMultipleUploadSummary } = await loadUtilities(t);

  assert.equal(calculateMultipleUploadSummary([item('success', 1, 1)]).status, 'success');
  assert.equal(
    calculateMultipleUploadSummary([item('success', 1, 1), item('error', 0, 1)]).status,
    'partial-success'
  );
  assert.equal(calculateMultipleUploadSummary([item('error', 0, 1)]).status, 'error');
  assert.equal(calculateMultipleUploadSummary([item('cancelled', 0, 1)]).status, 'cancelled');
});

test('upload concurrency defaults to three and rejects invalid values', async (t) => {
  const { normalizeUploadConcurrency } = await loadUtilities(t);

  assert.equal(normalizeUploadConcurrency(undefined), 3);
  assert.equal(normalizeUploadConcurrency(5), 5);
  assert.equal(normalizeUploadConcurrency(0), 3);
  assert.equal(normalizeUploadConcurrency(1.5), 3);
});

test('controller never uploads more files than its concurrency limit', async (t) => {
  const server = await createServer({
    configFile: false,
    resolve: { alias: { '@': resolve('src') } },
    server: { middlewareMode: true, ws: false },
    appType: 'custom'
  });
  t.after(() => server.close());
  const { MultipleFileUploadController } = await server.ssrLoadModule(
    '/src/shared/hooks/use-multiple-file-upload/multiple-file-upload.controller.ts'
  );

  let activeUploads = 0;
  let maximumActiveUploads = 0;
  const completions = [];
  const service = {
    async discoverCapabilities() {
      throw new Error('Capability discovery should be disabled in this test');
    },
    createTask(options) {
      let complete;
      const completion = new Promise((resolveCompletion) => {
        complete = () => {
          activeUploads -= 1;
          resolveCompletion({
            attachmentId: options.file.name,
            file: options.file,
            uploadId: options.file.name,
            uploadUrl: `http://localhost/files/${options.file.name}`
          });
        };
      });
      return {
        async cancel() {},
        async dispose() {},
        async pause() {},
        resume() {},
        start() {
          activeUploads += 1;
          maximumActiveUploads = Math.max(maximumActiveUploads, activeUploads);
          completions.push(complete);
          return completion;
        }
      };
    }
  };
  const controller = new MultipleFileUploadController(
    {
      concurrency: 2,
      discoverServerCapabilities: false,
      endpoint: '/files',
      getAccessToken: () => 'token'
    },
    service
  );
  const files = Array.from({ length: 5 }, (_, index) => ({
    lastModified: index,
    name: `file-${index}.bin`,
    size: 10,
    type: 'application/octet-stream'
  }));

  controller.addFiles(files);
  const completed = controller.waitForAll();
  while (controller.getSnapshot().summary.completedCount < files.length) {
    const complete = completions.shift();
    if (complete) complete();
    await new Promise((resolveTick) => setTimeout(resolveTick, 0));
  }

  const summary = await completed;
  assert.equal(maximumActiveUploads, 2);
  assert.equal(summary.successCount, 5);
  assert.equal(summary.status, 'success');
  controller.dispose();
});

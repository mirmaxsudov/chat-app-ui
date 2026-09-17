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
  return server.ssrLoadModule('/src/shared/hooks/use-file-upload/file-upload.utils.ts');
};

test('upload helpers normalize endpoints and parse TUS capabilities', async (t) => {
  const { parseTusCapabilities, resolveUploadEndpoint } = await loadUtilities(t);

  assert.equal(resolveUploadEndpoint('https://api.example.com/', undefined), 'https://api.example.com/files');
  assert.equal(resolveUploadEndpoint(undefined, '/custom/files/'), '/custom/files');
  assert.deepEqual(
    parseTusCapabilities(
      new Headers({
        'Tus-Extension': 'creation,termination',
        'Tus-Max-Size': '10737418240',
        'Tus-Version': '1.0.0'
      })
    ),
    {
      extensions: ['creation', 'termination'],
      maxFileSize: 10_737_418_240,
      versions: ['1.0.0']
    }
  );
});

test('upload validation rejects empty and oversized files', async (t) => {
  const { validateFile } = await loadUtilities(t);
  const emptyFile = { size: 0 };
  const largeFile = { size: 11 };

  assert.throws(() => validateFile(emptyFile, null), (error) => {
    assert.equal(error.name, 'FileUploadError');
    assert.equal(error.code, 'EMPTY_FILE');
    return true;
  });
  assert.throws(() => validateFile(largeFile, 10), (error) => {
    assert.equal(error.name, 'FileUploadError');
    assert.equal(error.code, 'FILE_TOO_LARGE');
    return true;
  });
});

test('progress reports percentage, throughput, and remaining time', async (t) => {
  const { calculateProgress } = await loadUtilities(t);
  const progress = calculateProgress(500, 1_000, 1_000, 3_000);

  assert.equal(progress.percentage, 50);
  assert.equal(progress.bytesPerSecond, 250);
  assert.equal(progress.estimatedSecondsRemaining, 2);
});

test('TUS environment config converts retry seconds to milliseconds', async (t) => {
  const server = await createServer({
    configFile: false,
    resolve: { alias: { '@': resolve('src') } },
    server: { middlewareMode: true, ws: false },
    appType: 'custom'
  });
  t.after(() => server.close());
  const { resolveTusUploadConfig } = await server.ssrLoadModule(
    '/src/shared/hooks/use-file-upload/file-upload.config.ts'
  );

  assert.deepEqual(
    resolveTusUploadConfig({
      VITE_TUS_UPLOAD_CHUNK_SIZE: '10485760',
      VITE_TUS_UPLOAD_RETRY_INTERVAL: '1,3,5,10,30,60'
    }),
    {
      chunkSize: 10_485_760,
      retryDelays: [1_000, 3_000, 5_000, 10_000, 30_000, 60_000]
    }
  );
});

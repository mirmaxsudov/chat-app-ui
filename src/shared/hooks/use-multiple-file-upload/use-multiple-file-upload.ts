import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveUploadEndpoint } from '../use-file-upload';
import { MultipleFileUploadController } from './multiple-file-upload.controller';
import type {
  AddFilesOptions,
  UseMultipleFileUploadOptions,
  UseMultipleFileUploadResult
} from './types';

export const useMultipleFileUpload = (
  options: UseMultipleFileUploadOptions
): UseMultipleFileUploadResult => {
  const resolvedOptions = useMemo(
    () => ({
      ...options,
      endpoint: resolveUploadEndpoint(import.meta.env.VITE_API_BASE_URL, options.endpoint)
    }),
    [options]
  );

  const [controller] = useState(() => new MultipleFileUploadController(resolvedOptions));
  const [snapshot, setSnapshot] = useState(controller.getSnapshot);
  const lifecycle = useRef({ generation: 0 });

  useEffect(() => {
    controller.setOptions(resolvedOptions);
  }, [controller, resolvedOptions]);

  useEffect(() => {
    const marker = lifecycle.current;
    const generation = ++marker.generation;
    const unsubscribe = controller.subscribe(() => setSnapshot(controller.getSnapshot()));
    return () => {
      unsubscribe();
      // React Strict Mode immediately replays effects in development. Defer disposal so the
      // replay can retain the same controller, while a real unmount still releases uploads.
      queueMicrotask(() => {
        if (marker.generation === generation) controller.dispose();
      });
    };
  }, [controller]);

  const addFiles = useCallback(
    (files: Iterable<File>, addOptions?: AddFilesOptions) => controller.addFiles(files, addOptions),
    [controller]
  );

  return useMemo(
    () => ({
      ...snapshot.summary,
      addFiles,
      cancelAll: () => controller.cancelAll(),
      cancelUpload: (id: string) => controller.cancelUpload(id),
      capabilities: snapshot.capabilities,
      discoverCapabilities: () => controller.discoverCapabilities(),
      items: snapshot.items,
      pauseAll: () => controller.pauseAll(),
      pauseUpload: (id: string) => controller.pauseUpload(id),
      removeUpload: (id: string) => controller.removeUpload(id),
      reset: () => controller.reset(),
      resumeAll: () => controller.resumeAll(),
      resumeUpload: (id: string) => controller.resumeUpload(id),
      retryFailed: () => controller.retryFailed(),
      retryUpload: (id: string) => controller.retryUpload(id),
      startAll: () => controller.startAll(),
      waitForAll: () => controller.waitForAll()
    }),
    [addFiles, controller, snapshot]
  );
};

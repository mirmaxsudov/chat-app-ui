import { useCallback, useEffect, useState } from 'react';

import { preloadOriginalImage } from '@/modules/message';
import { observeNearViewport } from '@/modules/message';

export type ProgressiveImagePhase =
  'error' | 'loading-original' | 'original' | 'placeholder' | 'preview';

interface UseProgressiveImageOptions {
  deferOriginal?: boolean;
  originalUrl: string;
  previewUrl: string | null;
  rootMargin?: string;
}

export const useProgressiveImage = ({
  previewUrl,
  originalUrl,
  deferOriginal = false,
  rootMargin = '800px 0px'
}: UseProgressiveImageOptions) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [approachedOriginalUrl, setApproachedOriginalUrl] = useState<string | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [loadedOriginalUrl, setLoadedOriginalUrl] = useState<string | null>(null);
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (!container) return;
    return observeNearViewport(
      container,
      (near) => {
        setIsNearViewport(near);
        if (near) setApproachedOriginalUrl(originalUrl);
      },
      rootMargin
    );
  }, [container, originalUrl, rootMargin]);

  const hasApproachedViewport = approachedOriginalUrl === originalUrl;
  const originalLoaded = originalUrl === previewUrl || loadedOriginalUrl === originalUrl;
  const originalFailed = failedUrls.has(originalUrl);
  const previewFailed = previewUrl ? failedUrls.has(previewUrl) : false;
  const shouldLoadOriginal =
    hasApproachedViewport &&
    !deferOriginal &&
    Boolean(originalUrl) &&
    !originalLoaded &&
    !originalFailed;

  useEffect(() => {
    if (!shouldLoadOriginal) return;

    let disposed = false;
    void preloadOriginalImage(originalUrl).then(
      () => {
        if (disposed) return;
        setLoadedOriginalUrl(originalUrl);
      },
      () => {
        if (disposed) return;
        setFailedUrls((current) => new Set(current).add(originalUrl));
      }
    );
    return () => {
      disposed = true;
    };
  }, [originalUrl, shouldLoadOriginal]);

  const sourceUrl =
    originalLoaded && !originalFailed
      ? originalUrl
      : previewUrl && !previewFailed
        ? previewUrl
        : null;
  const phase: ProgressiveImagePhase =
    originalLoaded && !originalFailed
      ? 'original'
      : shouldLoadOriginal
        ? 'loading-original'
        : originalFailed
          ? previewUrl && !previewFailed
            ? 'preview'
            : 'error'
          : previewUrl && !previewFailed
            ? 'preview'
            : 'placeholder';

  const onImageError = useCallback(() => {
    if (!sourceUrl) return;
    setFailedUrls((current) => new Set(current).add(sourceUrl));
  }, [sourceUrl]);

  return {
    containerRef: setContainer,
    isNearViewport,
    onImageError,
    phase,
    sourceUrl
  };
};

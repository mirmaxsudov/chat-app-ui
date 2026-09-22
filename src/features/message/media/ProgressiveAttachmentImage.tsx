import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import type { PreviewStatus } from '../model/message.types';
import { useProgressiveImage } from './use-progressive-image';

interface ProgressiveAttachmentImageProps {
  alt: string;
  className?: string;
  fallback?: ReactNode;
  originalUrl: string;
  previewHeight?: number | null;
  previewStatus?: PreviewStatus;
  previewUrl: string | null;
  previewWidth?: number | null;
  rootMargin?: string;
  pendingKey?: string;
  onPendingVisibilityChange?: (key: string, visible: boolean) => void;
}

export const ProgressiveAttachmentImage = ({
  alt,
  className,
  fallback,
  originalUrl,
  previewHeight,
  previewStatus,
  previewUrl,
  previewWidth,
  rootMargin,
  pendingKey,
  onPendingVisibilityChange
}: ProgressiveAttachmentImageProps) => {
  const pending = previewStatus === 'PENDING' || previewStatus === 'PROCESSING';
  const { containerRef, isNearViewport, onImageError, phase, sourceUrl } = useProgressiveImage({
    previewUrl,
    originalUrl,
    deferOriginal: pending,
    rootMargin
  });

  useEffect(() => {
    if (!pendingKey || !onPendingVisibilityChange) return;
    onPendingVisibilityChange(pendingKey, pending && isNearViewport);
    return () => onPendingVisibilityChange(pendingKey, false);
  }, [isNearViewport, onPendingVisibilityChange, pending, pendingKey]);

  const aspectRatio =
    previewWidth && previewHeight ? `${previewWidth} / ${previewHeight}` : '16 / 9';

  return (
    <figure
      ref={containerRef}
      data-phase={phase}
      aria-busy={phase === 'loading-original'}
      style={{ aspectRatio } satisfies CSSProperties}
      className={cn('relative isolate m-0 min-h-28 w-full overflow-hidden bg-[#bfd0cc]', className)}
    >
      {sourceUrl ? (
        <img
          key={sourceUrl}
          src={sourceUrl}
          alt={alt}
          decoding='async'
          loading='lazy'
          onError={onImageError}
          className='animate-in fade-in absolute inset-0 z-10 size-full object-cover duration-200 motion-reduce:animate-none'
        />
      ) : phase === 'error' ? (
        fallback
      ) : (
        <span
          role='img'
          aria-label={`Loading ${alt}`}
          className='absolute inset-0 animate-pulse bg-[linear-gradient(105deg,transparent_25%,rgba(255,255,255,0.32)_48%,transparent_72%)] bg-[length:220%_100%] motion-reduce:animate-none'
        />
      )}
      {phase === 'loading-original' && sourceUrl && (
        <span className='absolute right-2 bottom-2 z-20 rounded-md border border-white/25 bg-black/55 px-1.5 py-1 text-[0.55rem] leading-none font-bold tracking-[0.12em] text-white backdrop-blur-sm'>
          HD
        </span>
      )}
    </figure>
  );
};

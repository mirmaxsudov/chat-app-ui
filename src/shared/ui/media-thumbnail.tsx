import { useState, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface MediaThumbnailProps extends Omit<ComponentProps<'img'>, 'src'> {
  containerClassName?: string;
  fallback?: ReactNode;
  fit?: 'contain' | 'cover';
  loadingIndicator?: ReactNode;
  src?: string | null;
}

const LoadedThumbnail = ({
  alt,
  className,
  fallback,
  fit = 'cover',
  loadingIndicator,
  src,
  ...props
}: Omit<MediaThumbnailProps, 'containerClassName'> & { src: string }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <>
      {status !== 'error' && (
        <img
          {...props}
          src={src}
          alt={alt}
          className={cn(
            'absolute inset-0 z-10 size-full transition-opacity duration-300',
            fit === 'contain' ? 'object-contain' : 'object-cover',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={(event) => {
            setStatus('loaded');
            props.onLoad?.(event);
          }}
          onError={(event) => {
            setStatus('error');
            props.onError?.(event);
          }}
        />
      )}
      {status === 'loading' && loadingIndicator}
      {status === 'error' && <span className='absolute inset-0 z-0'>{fallback}</span>}
    </>
  );
};

/**
 * Stable media frame with an immediate fallback. A new source remounts only the image layer,
 * allowing delayed thumbnails to fade in without shifting the surrounding layout.
 */
export const MediaThumbnail = ({
  alt,
  className,
  containerClassName,
  fallback,
  fit,
  loadingIndicator,
  src,
  ...props
}: MediaThumbnailProps) => (
  <span
    data-slot='media-thumbnail'
    data-state={src ? 'available' : 'pending'}
    className={cn('relative block overflow-hidden', containerClassName)}
  >
    {!src ? (
      <span className='absolute inset-0 z-0'>{fallback}</span>
    ) : (
      <LoadedThumbnail
        key={src}
        {...props}
        src={src}
        alt={alt}
        className={className}
        fallback={fallback}
        fit={fit}
        loadingIndicator={loadingIndicator}
      />
    )}
  </span>
);

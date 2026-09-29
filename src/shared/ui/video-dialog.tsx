import type { ComponentProps } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog';

interface VideoDialogProps {
  open: boolean;
  options?: ComponentProps<'video'>;
  poster?: string | null;
  source: string;
  title: string;
  onOpenChange: (open: boolean) => void;
}

/** Accessible, reusable native video player presented on a focused media surface. */
export const VideoDialog = ({
  onOpenChange,
  open,
  poster,
  source,
  title,
  options
}: VideoDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='w-auto max-w-[calc(100%-2rem)] gap-0 overflow-hidden bg-black p-0 text-white ring-white/15 sm:max-w-[min(64rem,calc(100%-3rem))]'>
      <DialogHeader className='sr-only'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Video player for {title}</DialogDescription>
      </DialogHeader>
      <video
        {...options}
        controls
        playsInline
        key={source}
        aria-label={title}
        className='max-h-[82vh] min-h-48 w-auto max-w-full bg-black object-contain sm:min-w-xl'
        poster={poster ?? undefined}
        preload='none'
        src={source}
      >
        Your browser does not support video playback.
      </video>
    </DialogContent>
  </Dialog>
);

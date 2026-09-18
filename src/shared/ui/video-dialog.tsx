import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog';
import type { ComponentProps } from 'react';

interface VideoDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  poster?: string | null;
  source: string;
  title: string;
  options?: ComponentProps<'video'>;
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
        key={source}
        src={source}
        poster={poster ?? undefined}
        controls
        playsInline
        preload='metadata'
        aria-label={title}
        className='max-h-[82vh] min-h-48 w-auto max-w-full bg-black object-contain sm:min-w-xl'
      >
        Your browser does not support video playback.
      </video>
    </DialogContent>
  </Dialog>
);

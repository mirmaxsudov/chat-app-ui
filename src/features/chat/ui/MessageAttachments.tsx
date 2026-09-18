import { useState } from 'react';
import {
  FileArchive,
  FileAudio,
  FileChartColumn,
  FileText,
  LoaderCircle,
  Play
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { MediaThumbnail } from '@/shared/ui/media-thumbnail';
import { VideoDialog } from '@/shared/ui/video-dialog';
import type { ChatMessageAttachment } from '@/features/message/model/message.types';
import { ImageZoom } from '@/shared/ui/image-zoom.tsx';

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 1) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const isImage = ({ attachment }: ChatMessageAttachment) =>
  attachment.type === 'IMAGE' || attachment.contentType.startsWith('image/');

const isVideo = ({ attachment }: ChatMessageAttachment) =>
  attachment.type === 'VIDEO' || attachment.contentType.startsWith('video/');

const isVisualMedia = (item: ChatMessageAttachment) => isImage(item) || isVideo(item);

const FileIcon = ({ type }: { type: ChatMessageAttachment['attachment']['type'] }) => {
  if (type === 'AUDIO') return <FileAudio className='size-5' />;
  if (type === 'EXCEL') return <FileChartColumn className='size-5' />;
  if (type === 'PDF' || type === 'PPT') return <FileText className='size-5' />;
  return <FileArchive className='size-5' />;
};

const LoadingIndicator = () => (
  <span className='absolute inset-0 z-20 grid place-items-center bg-[#1f302c]/20'>
    <span className='grid size-11 place-items-center rounded-full bg-[#1f302c]/55 text-white shadow-lg backdrop-blur-sm'>
      <LoaderCircle className='size-6 animate-spin' />
    </span>
  </span>
);

const MediaPreview = ({
  item,
  source,
  video = false
}: {
  item: ChatMessageAttachment;
  source: string | null;
  video?: boolean;
}) => {
  const { attachment } = item;

  return (
    <>
      <MediaThumbnail
        src={source}
        alt={attachment.name}
        fit='cover'
        containerClassName={cn(
          'aspect-video h-full max-h-80 min-h-28 w-full',
          video ? 'bg-black' : 'bg-[#bfd0cc]'
        )}
        className='transition duration-300 group-hover/media:scale-[1.015]'
        loadingIndicator={<LoadingIndicator />}
        fallback={
          video ? (
            <span className='block size-full bg-black' />
          ) : (
            <span className='flex size-full min-h-28 items-center justify-center gap-2 bg-[#bfd0cc] px-4 text-xs font-medium text-[#40544f]'>
              <FileIcon type={attachment.type} />
              Image unavailable
            </span>
          )
        }
      />
      {video && (
        <span className='pointer-events-none absolute inset-0 z-20 grid place-items-center'>
          <span className='grid size-12 place-items-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-[2px] transition-transform duration-200 group-hover/media:scale-105'>
            <Play className='ml-0.5 size-5 fill-current' />
          </span>
        </span>
      )}
    </>
  );
};

const MessageImage = ({ item }: { item: ChatMessageAttachment }) => {
  const { attachment } = item;

  return (
    <ImageZoom
      className='group/media relative block min-h-28 overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#168acd]'
      aria-label={`Open image ${attachment.name}`}
    >
      <MediaPreview item={item} source={attachment.publicURL} />
    </ImageZoom>
  );
};

const MessageVideo = ({ item }: { item: ChatMessageAttachment }) => {
  const [open, setOpen] = useState(false);
  const { attachment } = item;

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='group/media relative block min-h-28 overflow-hidden rounded-xl bg-black text-left outline-none focus-visible:ring-2 focus-visible:ring-[#168acd]'
        aria-label={`Play video ${attachment.name}`}
      >
        <MediaPreview item={item} source={attachment.thumbnailURL} video />
      </button>
      {open && (
        <VideoDialog
          options={{
            autoPlay: true
          }}
          open
          onOpenChange={setOpen}
          source={attachment.publicURL}
          poster={attachment.thumbnailURL}
          title={attachment.name}
        />
      )}
    </>
  );
};

const MessageFile = ({ item }: { item: ChatMessageAttachment }) => {
  const { attachment } = item;
  return (
    <a
      href={attachment.publicURL}
      target='_blank'
      rel='noreferrer'
      download={attachment.name}
      className='flex min-w-56 items-center gap-2.5 rounded-xl bg-black/[0.045] p-2 pr-3 transition outline-none hover:bg-black/[0.075] focus-visible:ring-2 focus-visible:ring-[#168acd]'
    >
      <span className='grid size-10 shrink-0 place-items-center rounded-full bg-[#168acd] text-white shadow-sm'>
        <FileIcon type={attachment.type} />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block truncate text-xs font-semibold'>{attachment.name}</span>
        <span className='mt-0.5 block text-[0.65rem] text-[#6d7d78]'>
          {formatFileSize(attachment.sizeBytes)}
        </span>
      </span>
    </a>
  );
};

export const MessageAttachments = ({ attachments }: { attachments: ChatMessageAttachment[] }) => {
  const ordered = [...attachments].sort((left, right) => left.sortOrder - right.sortOrder);
  const groups = ordered.reduce<Array<{ media: boolean; items: ChatMessageAttachment[] }>>(
    (result, item) => {
      const media = isVisualMedia(item);
      const previous = result.at(-1);
      if (previous?.media === media) previous.items.push(item);
      else result.push({ media, items: [item] });
      return result;
    },
    []
  );

  return (
    <div className='flex flex-col gap-1.5'>
      {groups.map((group, groupIndex) =>
        group.media ? (
          <div
            key={`media-${groupIndex}`}
            className={cn(
              'grid max-w-80 gap-0.5 overflow-hidden rounded-[0.8rem]',
              group.items.length > 1 && 'grid-cols-2',
              group.items.length === 3 && '[&>*:first-child]:col-span-2'
            )}
          >
            {group.items.map((item) => {
              const Component = isVideo(item) ? MessageVideo : MessageImage;
              return (
                <Component key={`${item.sortOrder}-${item.attachment.publicURL}`} item={item} />
              );
            })}
          </div>
        ) : (
          <div key={`files-${groupIndex}`} className='flex flex-col gap-1'>
            {group.items.map((item) => (
              <MessageFile key={`${item.sortOrder}-${item.attachment.publicURL}`} item={item} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

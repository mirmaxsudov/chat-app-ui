import { useState } from 'react';
import { FileArchive, FileAudio, FileChartColumn, FileText, LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ChatMessageAttachment } from '@/features/message/model/message.types';

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 1) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const isImage = ({ attachment }: ChatMessageAttachment) =>
  attachment.type === 'IMAGE' || attachment.contentType.startsWith('image/');

const FileIcon = ({ type }: { type: ChatMessageAttachment['attachment']['type'] }) => {
  if (type === 'AUDIO') return <FileAudio className='size-5' />;
  if (type === 'EXCEL') return <FileChartColumn className='size-5' />;
  if (type === 'PDF' || type === 'PPT') return <FileText className='size-5' />;
  return <FileArchive className='size-5' />;
};

const MessageImage = ({ item }: { item: ChatMessageAttachment }) => {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { attachment } = item;

  return (
    <a
      href={attachment.publicURL}
      target='_blank'
      rel='noreferrer'
      className='group/image relative block min-h-28 overflow-hidden rounded-xl bg-[#bfd0cc] outline-none focus-visible:ring-2 focus-visible:ring-[#168acd]'
      aria-label={`Open image ${attachment.name}`}
    >
      {!failed && (
        <img
          src={attachment.publicURL}
          alt={attachment.name}
          className={cn(
            'h-full max-h-80 min-h-28 w-full object-cover transition duration-300 group-hover/image:scale-[1.015]',
            loading && 'opacity-0'
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}
      {loading && (
        <span className='absolute inset-0 grid place-items-center bg-[#6d817d]/30'>
          <span className='grid size-11 place-items-center rounded-full bg-[#1f302c]/55 text-white shadow-lg backdrop-blur-sm'>
            <LoaderCircle className='size-6 animate-spin' />
          </span>
        </span>
      )}
      {failed && (
        <span className='flex min-h-28 items-center justify-center gap-2 px-4 text-xs font-medium text-[#40544f]'>
          <FileIcon type={attachment.type} />
          Image unavailable
        </span>
      )}
    </a>
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
      className='flex min-w-56 items-center gap-2.5 rounded-xl bg-black/[0.045] p-2 pr-3 outline-none transition hover:bg-black/[0.075] focus-visible:ring-2 focus-visible:ring-[#168acd]'
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
  const groups = ordered.reduce<Array<{ image: boolean; items: ChatMessageAttachment[] }>>(
    (result, item) => {
      const image = isImage(item);
      const previous = result.at(-1);
      if (previous?.image === image) previous.items.push(item);
      else result.push({ image, items: [item] });
      return result;
    },
    []
  );

  return (
    <div className='flex flex-col gap-1.5'>
      {groups.map((group, groupIndex) =>
        group.image ? (
          <div
            key={`images-${groupIndex}`}
            className={cn(
              'grid max-w-80 gap-0.5 overflow-hidden rounded-[0.8rem]',
              group.items.length > 1 && 'grid-cols-2',
              group.items.length === 3 && '[&>*:first-child]:col-span-2'
            )}
          >
            {group.items.map((item) => (
              <MessageImage
                key={`${item.sortOrder}-${item.attachment.publicURL}`}
                item={item}
              />
            ))}
          </div>
        ) : (
          <div key={`files-${groupIndex}`} className='flex flex-col gap-1'>
            {group.items.map((item) => (
              <MessageFile
                key={`${item.sortOrder}-${item.attachment.publicURL}`}
                item={item}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

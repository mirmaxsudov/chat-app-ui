import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FileArchive, FileImage, LoaderCircle, Paperclip, RotateCcw, Send, X } from 'lucide-react';
import { getAuthSession } from '@/features/auth/session';
import { useMultipleFileUpload } from '@/shared/hooks/use-multiple-file-upload';
import type { MultipleFileUploadItem } from '@/shared/hooks/use-multiple-file-upload';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupTextarea } from '@/shared/ui/input-group';
import { cn } from '@/shared/lib/utils';

interface MessageComposerProps {
  onSend: (message: string, attachments: string[]) => Promise<boolean>;
  isSending: boolean;
  disabled?: boolean;
  error?: string;
}

const getAccessToken = () => getAuthSession()?.accessToken ?? null;
const FILE_UPLOAD_OPTIONS = { autoStart: false, getAccessToken };

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const uploadStateLabel = (item: MultipleFileUploadItem) => {
  if (item.status === 'error') return item.error?.message ?? 'Upload failed';
  if (item.status === 'paused') return 'Upload paused';
  if (item.status === 'success' && !item.attachmentId) return 'Upload reference unavailable';
  if (item.status === 'success') return formatFileSize(item.file.size);
  if (item.status === 'pending') return 'Ready to send';
  if (item.status === 'queued') return 'Waiting…';
  if (item.status === 'validating') return 'Preparing…';
  return `${Math.round(item.percentage)}% uploaded`;
};

const CircularProgress = ({ value }: { value: number }) => (
  <span
    role='progressbar'
    aria-label='Uploading attachment'
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value)}
    className='relative grid size-11 place-items-center rounded-full bg-[#172a26]/65 text-[0.62rem] font-bold text-white shadow-lg backdrop-blur-sm'
    style={{
      background: `conic-gradient(#fff ${Math.max(value, 4) * 3.6}deg, rgba(20,39,35,.58) 0)`
    }}
  >
    <span className='grid size-9 place-items-center rounded-full bg-[#263d38]/90'>
      {Math.round(value)}
    </span>
  </span>
);

const UploadPreview = ({
  item,
  disabled,
  onRemove,
  onRetry
}: {
  item: MultipleFileUploadItem;
  disabled: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) => {
  const [previewUrl] = useState(() =>
    item.file.type.startsWith('image/') ? URL.createObjectURL(item.file) : null
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );
  const busy = ['queued', 'validating', 'uploading'].includes(item.status);
  const problem = item.status === 'error' || (item.status === 'success' && !item.attachmentId);

  return (
    <article
      className={cn(
        'group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-[#e8efed] shadow-sm',
        problem ? 'border-red-300' : 'border-white/80'
      )}
    >
      {previewUrl ? (
        <img src={previewUrl} alt='' className='size-full object-cover' />
      ) : (
        <div className='flex size-full flex-col items-center justify-center gap-1.5 px-2 text-[#4f6660]'>
          <FileArchive className='size-7' />
          <span className='w-full truncate text-center text-[0.62rem] font-semibold'>
            {item.file.name}
          </span>
        </div>
      )}

      {busy && (
        <div className='absolute inset-0 grid place-items-center bg-[#243c37]/25'>
          <CircularProgress value={item.percentage} />
        </div>
      )}

      {problem && (
        <button
          type='button'
          onClick={onRetry}
          disabled={disabled}
          className='absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#5b2929]/70 text-[0.62rem] font-semibold text-white backdrop-blur-[2px] disabled:opacity-50'
          aria-label={`Retry upload for ${item.file.name}`}
        >
          <RotateCcw className='size-5' />
          Retry
        </button>
      )}

      <Button
        type='button'
        size='icon-xs'
        variant='secondary'
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove ${item.file.name}`}
        className='absolute top-1 right-1 z-10 size-6 rounded-full border border-white/70 bg-[#203530]/75 text-white opacity-100 shadow-md backdrop-blur-sm hover:bg-[#172723] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100'
      >
        <X className='size-3.5' />
      </Button>

      <div className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2 pt-5 pb-1.5 text-white'>
        <p className='truncate text-[0.62rem] font-semibold'>{item.file.name}</p>
        <p className='truncate text-[0.55rem] text-white/80'>{uploadStateLabel(item)}</p>
      </div>
    </article>
  );
};

export const MessageComposer = ({ onSend, isSending, disabled, error }: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const submitting = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploader = useMultipleFileUpload(FILE_UPLOAD_OPTIONS);
  const hasFiles = uploader.items.length > 0;
  const uploadHasError = uploader.items.some(
    (item) => item.status === 'error' || (item.status === 'success' && !item.attachmentId)
  );
  const busy = isSending || isSubmitting;
  const canSend =
    !disabled &&
    !busy &&
    !uploadHasError &&
    message.length <= 4096 &&
    (Boolean(message.trim()) || hasFiles);

  const submit = async () => {
    if (!canSend || submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setUploadError(undefined);
    try {
      const uploadedItems = hasFiles ? await uploader.startAll() : [];
      const uploadFailed = uploadedItems.some(
        (item) => item.status !== 'success' || !item.attachmentId
      );
      if (uploadFailed) {
        setUploadError('Some attachments could not be uploaded. Retry them before sending.');
        return;
      }
      const attachmentIds = uploadedItems.flatMap((item) =>
        item.attachmentId ? [item.attachmentId] : []
      );
      if (await onSend(message, attachmentIds)) {
        setMessage('');
        await uploader.reset();
      }
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  return (
    <form
      className='shrink-0 border-t border-[#d7e0e4] bg-white px-3 py-2.5 sm:px-4'
      onSubmit={handleSubmit}
    >
      <input
        ref={fileInput}
        type='file'
        multiple
        className='sr-only'
        aria-label='Choose attachments'
        disabled={disabled || busy}
        onChange={(event) => {
          if (event.target.files?.length) {
            setUploadError(undefined);
            uploader.addFiles(event.target.files);
          }
          event.target.value = '';
        }}
      />

      {hasFiles && (
        <div
          className='mb-2 flex scrollbar-none gap-2 overflow-x-auto rounded-2xl bg-[#f1f5f4] p-2'
          aria-label='Selected attachments'
        >
          {uploader.items.map((item) => (
            <UploadPreview
              key={item.id}
              item={item}
              disabled={Boolean(disabled || busy)}
              onRemove={() => {
                setUploadError(undefined);
                void uploader.removeUpload(item.id);
              }}
              onRetry={() => {
                setUploadError(undefined);
                if (item.status === 'error') {
                  uploader.retryUpload(item.id);
                  return;
                }
                void uploader.removeUpload(item.id).then(() => uploader.addFiles([item.file]));
              }}
            />
          ))}
        </div>
      )}

      {(error || uploadError) && (
        <p role='alert' id='send-error' className='text-destructive mb-2 text-xs'>
          {uploadError ?? error}
        </p>
      )}
      <div className='flex items-end gap-2'>
        <Button
          type='button'
          size='icon-lg'
          variant='ghost'
          disabled={disabled || busy}
          onClick={() => fileInput.current?.click()}
          className='size-10 shrink-0 rounded-full text-[#60756f] hover:bg-[#e7efed] hover:text-[#168acd]'
          aria-label='Attach files'
        >
          {hasFiles ? <FileImage className='size-5' /> : <Paperclip className='size-5' />}
        </Button>
        <InputGroup className='min-h-10 flex-1 rounded-2xl border-0 bg-[#f1f5f7] px-2 shadow-none'>
          <InputGroupTextarea
            value={message}
            placeholder={hasFiles ? 'Add a caption…' : 'Write a message…'}
            aria-label='Message'
            aria-describedby={error || uploadError ? 'send-error' : undefined}
            className='max-h-32 min-h-10 py-2 text-sm'
            rows={1}
            maxLength={4096}
            disabled={disabled || busy}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void submit();
              }
            }}
          />
        </InputGroup>
        <Button
          type='submit'
          size='icon-lg'
          disabled={!canSend}
          className='size-10 rounded-full bg-[#168acd] text-white hover:bg-[#087dbc]'
          aria-label={busy ? 'Sending message' : 'Send message'}
        >
          {busy ? <LoaderCircle className='size-5 animate-spin' /> : <Send className='size-5' />}
        </Button>
      </div>
    </form>
  );
};

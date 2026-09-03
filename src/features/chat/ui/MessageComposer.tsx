import { useRef, useState, type FormEvent } from 'react';
import { LoaderCircle, Send } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupTextarea } from '@/shared/ui/input-group';

interface MessageComposerProps {
  onSend: (message: string) => Promise<boolean>;
  isSending: boolean;
  disabled?: boolean;
  error?: string;
}

export const MessageComposer = ({ onSend, isSending, disabled, error }: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const submitting = useRef(false);

  const submit = async () => {
    if (!message.trim() || isSending || disabled || submitting.current || message.length > 4096)
      return;
    submitting.current = true;
    try {
      if (await onSend(message)) setMessage('');
    } finally {
      submitting.current = false;
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
      {error && (
        <p role='alert' id='send-error' className='text-destructive mb-2 text-xs'>
          {error}
        </p>
      )}
      <div className='flex items-end gap-2'>
        <InputGroup className='min-h-10 flex-1 rounded-2xl border-0 bg-[#f1f5f7] px-2 shadow-none'>
          <InputGroupTextarea
            value={message}
            placeholder='Write a message…'
            aria-label='Message'
            aria-describedby={error ? 'send-error' : undefined}
            className='max-h-32 min-h-10 py-2 text-sm'
            rows={1}
            maxLength={4096}
            disabled={disabled || isSending}
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
          disabled={disabled || isSending || !message.trim()}
          className='size-10 rounded-full bg-[#168acd] text-white hover:bg-[#087dbc]'
          aria-label={isSending ? 'Sending message' : 'Send message'}
        >
          {isSending ? (
            <LoaderCircle className='size-5 animate-spin' />
          ) : (
            <Send className='size-5' />
          )}
        </Button>
      </div>
    </form>
  );
};

import { ArrowLeft, Sidebar } from 'lucide-react';

import { presenceLabel } from '@/modules/presence';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

import { ChatAvatar } from '../ChatAvatar';

interface ChatHeaderProps {
  chat: ChatSummary;
  onBack: () => void;
  onToggleDetails: () => void;
}

export const ChatHeader = ({ chat, onBack, onToggleDetails }: ChatHeaderProps) => (
  <header className='flex h-17 shrink-0 items-center gap-2 border-b border-[#dfe6eb] bg-white px-2 sm:px-4'>
    <Button
      aria-label='Back to conversations'
      className='rounded-full text-[#71808b] md:hidden'
      size='icon-lg'
      variant='ghost'
      onClick={onBack}
    >
      <ArrowLeft className='size-5' />
    </Button>
    <button
      className='flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left hover:bg-[#f4f7f9]'
      type='button'
      onClick={onToggleDetails}
    >
      <ChatAvatar chat={chat} className='size-10' />
      <span className='min-w-0'>
        <span className='block truncate text-[0.86rem] font-semibold text-[#1e2b34]'>
          {chat.name}
        </span>
        <span
          className={cn(
            'block truncate text-[0.68rem] font-medium',
            chat.presence?.status === 'ONLINE' ? 'text-[#15945a]' : 'text-[#6f7f89]'
          )}
          title={chat.presence?.lastSeenAt ?? undefined}
        >
          {presenceLabel(chat.presence) ?? chat.status}
        </span>
      </span>
    </button>
    <Button
      aria-label='Toggle chat details'
      className='rounded-full text-[#71808b]'
      size='icon-lg'
      variant='ghost'
      onClick={onToggleDetails}
    >
      <Sidebar className='size-5' />
    </Button>
  </header>
);

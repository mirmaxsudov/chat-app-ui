import { ArrowLeft, Sidebar } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { ChatSummary } from '../model/chat.types';
import { ChatAvatar } from './ChatAvatar';

interface ChatHeaderProps {
  chat: ChatSummary;
  onBack: () => void;
  onToggleDetails: () => void;
}

export const ChatHeader = ({ chat, onBack, onToggleDetails }: ChatHeaderProps) => (
  <header className='flex h-[68px] shrink-0 items-center gap-2 border-b border-[#dfe6eb] bg-white px-2 sm:px-4'>
    <Button
      variant='ghost'
      size='icon-lg'
      className='rounded-full text-[#71808b] md:hidden'
      aria-label='Back to conversations'
      onClick={onBack}
    >
      <ArrowLeft className='size-5' />
    </Button>
    <button
      type='button'
      className='flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left hover:bg-[#f4f7f9]'
      onClick={onToggleDetails}
    >
      <ChatAvatar chat={chat} className='size-10' />
      <span className='min-w-0'>
        <span className='block truncate text-[0.86rem] font-semibold text-[#1e2b34]'>
          {chat.name}
        </span>
        <span className='block truncate text-[0.68rem] font-medium text-[#168acd]'>
          {chat.status}
        </span>
      </span>
    </button>
    <Button
      variant='ghost'
      size='icon-lg'
      className='rounded-full text-[#71808b]'
      aria-label='Toggle chat details'
      onClick={onToggleDetails}
    >
      <Sidebar className='size-5' />
    </Button>
  </header>
);

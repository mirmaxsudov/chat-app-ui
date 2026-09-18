import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import type { ChatSummary } from '../model/chat.types';
import { formatMessageDate } from '../model/chat-view';
import { ChatAvatar } from './ChatAvatar';
import { presenceLabel } from '../presence/presence-label';

export const ChatDetails = ({ chat, onClose }: { chat: ChatSummary; onClose: () => void }) => (
  <aside
    aria-label='Chat information'
    className='absolute inset-0 z-30 flex h-full min-h-0 flex-col overflow-y-auto border-l border-[#dfe6eb] bg-white shadow-[-16px_0_40px_rgba(45,67,80,0.12)] md:inset-y-0 md:right-0 md:left-auto md:w-80 xl:static xl:w-auto xl:shadow-none'
  >
    <div className='flex h-[68px] shrink-0 items-center gap-3 border-b border-[#dfe6eb] px-4'>
      <Button
        variant='ghost'
        size='icon-lg'
        className='rounded-full text-[#71808b]'
        aria-label='Close details'
        onClick={onClose}
      >
        <X className='size-5' />
      </Button>
      <h2 className='text-sm font-semibold'>Chat info</h2>
    </div>
    <div className='flex flex-col items-center px-6 py-7 text-center'>
      <ChatAvatar chat={chat} className='size-20' />
      <h3 className='mt-4 text-base font-semibold text-[#202e37]'>{chat.name}</h3>
      <p className='mt-1 text-xs font-medium text-[#168acd]'>
        {presenceLabel(chat.presence) ?? chat.status}
      </p>
    </div>
    <Separator className='bg-[#edf1f3]' />
    <dl className='space-y-5 p-5 text-sm'>
      {chat.username && (
        <div>
          <dt className='text-xs text-[#87949d]'>Username</dt>
          <dd className='mt-1 break-all'>@{chat.username}</dd>
        </div>
      )}
      <div>
        <dt className='text-xs text-[#87949d]'>Created</dt>
        <dd className='mt-1'>{formatMessageDate(chat.createdAt)}</dd>
      </div>
    </dl>
  </aside>
);

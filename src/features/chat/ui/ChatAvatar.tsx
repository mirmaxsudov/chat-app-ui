import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import type { ChatSummary } from '../model/chat.types';

interface ChatAvatarProps {
  chat: Pick<ChatSummary, 'initials' | 'color' | 'presence'>;
  className?: string;
}

export const ChatAvatar = ({ chat, className }: ChatAvatarProps) => (
  <Avatar className={cn('relative size-12 overflow-visible', className)}>
    <AvatarFallback className={cn('text-sm font-semibold text-white', chat.color)}>
      {chat.initials}
    </AvatarFallback>
    {chat.presence?.status === 'ONLINE' && (
      <span
        aria-label='Online'
        className='absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-[#2dbb73] shadow-[0_1px_4px_rgba(18,109,65,0.35)]'
      />
    )}
  </Avatar>
);

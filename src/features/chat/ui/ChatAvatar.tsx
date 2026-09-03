import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import type { ChatSummary } from '../model/chat.types';

interface ChatAvatarProps {
  chat: Pick<ChatSummary, 'initials' | 'color'>;
  className?: string;
}

export const ChatAvatar = ({ chat, className }: ChatAvatarProps) => (
  <Avatar className={cn('size-12', className)}>
    <AvatarFallback className={cn('text-sm font-semibold text-white', chat.color)}>
      {chat.initials}
    </AvatarFallback>
  </Avatar>
);

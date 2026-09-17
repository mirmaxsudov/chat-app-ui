import type { ReactNode } from 'react';
import type { CurrentUser } from '@/entities/user';
import { cn } from '@/shared/lib/utils';
import type { ChatSummary } from '../model/chat.types';
import { ConversationList } from './ConversationList';

interface ChatLayoutViewProps {
  activeChatId: string | null;
  chats: ChatSummary[];
  conversation?: ReactNode;
  currentUser: CurrentUser;
  error?: string;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  retry: () => void;
}

export const ChatLayoutView = ({
  activeChatId,
  chats,
  conversation,
  currentUser,
  error,
  hasMore,
  loading,
  loadingMore,
  loadMore,
  onLogout,
  onNewChat,
  onSelectChat,
  retry
}: ChatLayoutViewProps) => (
  <main className='h-svh overflow-hidden bg-[#d9e2e8] p-0 text-[#23313a]'>
    <div className='relative mx-auto grid h-full max-w-[1660px] overflow-hidden bg-white shadow-[0_16px_60px_rgba(36,57,70,0.16)] md:grid-cols-[340px_minmax(0,1fr)] lg:border lg:border-white/60 xl:grid-cols-[360px_minmax(0,1fr)]'>
      <div className={cn('relative min-h-0', activeChatId ? 'hidden md:block' : 'block')}>
        <ConversationList
          chats={chats}
          activeChatId={activeChatId}
          currentUser={currentUser}
          onLogout={onLogout}
          onSelect={(chat) => onSelectChat(chat.id)}
          onNewChat={onNewChat}
          loading={loading}
          error={error}
          onRetry={retry}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </div>
      <div className={cn('min-h-0 min-w-0', activeChatId ? 'flex' : 'hidden md:flex')}>
        {conversation ?? (
          <div className='grid h-full w-full place-items-center bg-[#dce8e5] p-8 text-center text-sm text-[#6f827d]'>
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  </main>
);

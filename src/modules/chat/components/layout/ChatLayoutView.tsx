import type { ReactNode } from 'react';

import type { RealtimeConnectionStatus } from '@/modules/presence';

import { ConversationList } from '@/modules/chat';
import { cn } from '@/shared/lib/utils';

interface ChatLayoutViewProps {
  activeChatId: string | null;
  chats: ChatSummary[];
  connectionStatus: RealtimeConnectionStatus;
  conversation?: ReactNode;
  error?: string;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  retry: () => void;
}

export const ChatLayoutView = ({
  activeChatId,
  chats,
  connectionStatus,
  conversation,
  error,
  hasMore,
  loading,
  loadingMore,
  loadMore,
  onNewChat,
  onSelectChat,
  retry
}: ChatLayoutViewProps) => (
  <main className='h-svh overflow-hidden bg-[#d9e2e8] p-0 text-[#23313a]'>
    {connectionStatus === 'reconnecting' && (
      <div
        aria-live='polite'
        className='fixed top-3 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#c6d5de] bg-white/95 px-3 py-1.5 text-xs font-medium text-[#536772] shadow-[0_8px_24px_rgba(36,57,70,0.18)] backdrop-blur'
        role='status'
      >
        Reconnecting…
      </div>
    )}
    <div className='relative mx-auto grid h-full max-w-[1660px] overflow-hidden bg-white shadow-[0_16px_60px_rgba(36,57,70,0.16)] md:grid-cols-[340px_minmax(0,1fr)] lg:border lg:border-white/60 xl:grid-cols-[360px_minmax(0,1fr)]'>
      <div className={cn('relative min-h-0', activeChatId ? 'hidden md:block' : 'block')}>
        <ConversationList
          activeChatId={activeChatId}
          chats={chats}
          error={error}
          hasMore={hasMore}
          loading={loading}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          onNewChat={onNewChat}
          onRetry={retry}
          onSelect={(chat) => onSelectChat(chat.id)}
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

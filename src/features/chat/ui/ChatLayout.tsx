import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { CurrentUser } from '@/entities/user';
import { cn } from '@/shared/lib/utils';
import { chatsInfiniteQueryOptions } from '../api';
import { toChatSummary } from '../model/chat-view';
import { requestErrorMessage } from '../model/request-error';
import { ChatConversation } from './ChatConversation';
import { ConversationList } from './ConversationList';
import { NewChatDialog } from './NewChatDialog';

interface ChatLayoutProps {
  currentUser: CurrentUser;
  onLogout: () => void;
}

export const ChatLayout = ({ currentUser, onLogout }: ChatLayoutProps) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const chatsQuery = useInfiniteQuery({
    ...chatsInfiniteQueryOptions(),
    refetchInterval: 15_000,
    meta: { withoutToastOnError: true }
  });
  const chats = useMemo(
    () =>
      [
        ...new Map(
          (chatsQuery.data?.pages.flatMap((page) => page.results) ?? []).map((chat) => [
            chat.id,
            chat
          ])
        ).values()
      ].map(toChatSummary),
    [chatsQuery.data]
  );

  return (
    <main className='h-svh overflow-hidden bg-[#d9e2e8] p-0 text-[#23313a]'>
      <div className='relative mx-auto grid h-full max-w-[1660px] overflow-hidden bg-white shadow-[0_16px_60px_rgba(36,57,70,0.16)] md:grid-cols-[340px_minmax(0,1fr)] lg:border lg:border-white/60 xl:grid-cols-[360px_minmax(0,1fr)]'>
        <div className={cn('relative min-h-0', activeChatId ? 'hidden md:block' : 'block')}>
          <ConversationList
            chats={chats}
            activeChatId={activeChatId}
            currentUser={currentUser}
            onLogout={onLogout}
            onSelect={(chat) => setActiveChatId(chat.id)}
            onNewChat={() => setCreatingChat(true)}
            loading={chatsQuery.isPending}
            error={
              chatsQuery.isError
                ? requestErrorMessage(chatsQuery.error, 'Unable to load conversations.')
                : undefined
            }
            onRetry={() => {
              void (chatsQuery.isFetchNextPageError
                ? chatsQuery.fetchNextPage()
                : chatsQuery.refetch());
            }}
            hasMore={chatsQuery.hasNextPage}
            loadingMore={chatsQuery.isFetchingNextPage}
            onLoadMore={() => {
              if (!chatsQuery.isFetching) void chatsQuery.fetchNextPage();
            }}
          />
        </div>
        <div className={cn('min-h-0 min-w-0', activeChatId ? 'flex' : 'hidden md:flex')}>
          {activeChatId ? (
            <ChatConversation
              key={activeChatId}
              chatId={activeChatId}
              onBack={() => setActiveChatId(null)}
            />
          ) : (
            <div className='grid h-full w-full place-items-center bg-[#dce8e5] p-8 text-center text-sm text-[#6f827d]'>
              Select a conversation or start a new one
            </div>
          )}
        </div>
      </div>
      {creatingChat && (
        <NewChatDialog onClose={() => setCreatingChat(false)} onCreated={setActiveChatId} />
      )}
    </main>
  );
};

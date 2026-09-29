import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toChatSummary } from '../helpers/chat-view';
import { requestErrorMessage } from '../helpers/request-error';
import { usePresenceStore } from '@/modules/presence';
import { chatsInfiniteQueryOptions } from '@/modules/chat';

export const useConversationList = () => {
  const presenceByUserId = usePresenceStore((state) => state.byUserId);
  const query = useInfiniteQuery({
    ...chatsInfiniteQueryOptions(),
    meta: { withoutToastOnError: true }
  });

  const chats = useMemo(
    () =>
      [
        ...new Map(
          (query.data?.pages.flatMap((page) => page.results) ?? []).map((chat) => [chat.id, chat])
        ).values()
      ].map((chat) => toChatSummary(chat, presenceByUserId[chat.peer.id] ?? chat.peerPresence)),
    [presenceByUserId, query.data]
  );

  return {
    chats,
    error: query.isError ? requestErrorMessage() : undefined,
    hasMore: query.hasNextPage,
    loading: query.isPending,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => {
      if (!query.isFetching) void query.fetchNextPage();
    },
    retry: () => {
      void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch());
    }
  };
};

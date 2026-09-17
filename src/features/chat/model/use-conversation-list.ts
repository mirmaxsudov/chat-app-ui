import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { chatsInfiniteQueryOptions } from '../api';
import { toChatSummary } from './chat-view';
import { requestErrorMessage } from './request-error';

export const useConversationList = () => {
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
      ].map(toChatSummary),
    [query.data]
  );

  return {
    chats,
    error: query.isError
      ? requestErrorMessage(query.error, 'Unable to load conversations.')
      : undefined,
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

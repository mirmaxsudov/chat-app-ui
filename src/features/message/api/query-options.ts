import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getChatMessages, type GetChatMessagesRequest } from './message.api';

export const messageQueryKeys = {
  all: ['messages'] as const,
  byChat: (chatId: string) => [...messageQueryKeys.all, 'chat', chatId] as const,
  history: (request: GetChatMessagesRequest) =>
    [...messageQueryKeys.byChat(request.chatId), 'history', request] as const,
  infiniteHistory: (chatId: string, size: number) =>
    [...messageQueryKeys.byChat(chatId), 'infinite', { size }] as const
};

const normalizeHistoryParams = ({
  chatId,
  beforeSeq,
  size = 50
}: GetChatMessagesRequest): GetChatMessagesRequest => ({ chatId, beforeSeq, size });

export const chatMessagesQueryOptions = (request: GetChatMessagesRequest) => {
  const params = normalizeHistoryParams(request);

  return queryOptions({
    queryKey: messageQueryKeys.history(params),
    queryFn: ({ signal }) => getChatMessages(params, signal),
    enabled: Boolean(params.chatId),
    staleTime: 0
  });
};

export interface ChatMessagesInfiniteQueryOptionsRequest {
  chatId: string;
  size?: number;
}

export const chatMessagesInfiniteQueryOptions = ({
  chatId,
  size = 50
}: ChatMessagesInfiniteQueryOptionsRequest) =>
  infiniteQueryOptions({
    queryKey: messageQueryKeys.infiniteHistory(chatId, size),
    queryFn: ({ pageParam, signal }) =>
      getChatMessages({ chatId, size, beforeSeq: pageParam }, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextBeforeSeq ?? undefined) : undefined,
    enabled: Boolean(chatId),
    staleTime: 0
  });

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import type { GetChatMessagesRequest } from '@/utils/api';

import { mergeLatestMessages, mergeMessageHistory } from '@/modules/message/helpers';
import { getChatMessages } from '@/utils/api';

export const MESSAGE_QUERY_OPTIONS = {
  all: ['messages'] as const,
  byChat: (chatId: string) => [...MESSAGE_QUERY_OPTIONS.all, 'chat', chatId] as const,
  history: (request: GetChatMessagesRequest) =>
    [
      ...MESSAGE_QUERY_OPTIONS.all,
      ...MESSAGE_QUERY_OPTIONS.byChat(request.chatId),
      'history',
      request
    ] as const,
  infiniteHistory: (chatId: string, size: number) =>
    [...MESSAGE_QUERY_OPTIONS.byChat(chatId), 'infinite', { size }] as const
} as const;

const normalizeHistoryParams = ({
  chatId,
  beforeSeq,
  size = 50
}: GetChatMessagesRequest): GetChatMessagesRequest => ({ chatId, beforeSeq, size });

export const chatMessagesQueryOptions = (request: GetChatMessagesRequest) => {
  const params = normalizeHistoryParams(request);

  return queryOptions({
    queryKey: MESSAGE_QUERY_OPTIONS.history(params),
    queryFn: ({ signal }) => getChatMessages(params, signal),
    structuralSharing:
      params.beforeSeq === undefined
        ? (old, next) => mergeLatestMessages(old, next, params.size ?? 50)
        : true,
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
    queryKey: MESSAGE_QUERY_OPTIONS.infiniteHistory(chatId, size),
    queryFn: ({ pageParam, signal }) =>
      getChatMessages({ chatId, size, beforeSeq: pageParam }, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextBeforeSeq ?? undefined) : undefined,
    enabled: Boolean(chatId),
    structuralSharing: (old, next) => mergeMessageHistory(old, next, size),
    staleTime: 0
  });

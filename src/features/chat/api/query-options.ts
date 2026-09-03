import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getChatById, getChats, type GetChatsRequest } from './chat.api';
import { mergeChat, mergeChatList, mergeInfiniteChatList } from '../model/chat-cache';

const normalizeListParams = ({ page = 0, size = 20 }: GetChatsRequest = {}) => ({ page, size });

export const chatQueryKeys = {
  all: ['chats'] as const,
  lists: () => [...chatQueryKeys.all, 'list'] as const,
  list: (params: Required<GetChatsRequest>) => [...chatQueryKeys.lists(), params] as const,
  infiniteList: (size: number) => [...chatQueryKeys.lists(), 'infinite', { size }] as const,
  details: () => [...chatQueryKeys.all, 'detail'] as const,
  detail: (chatId: string) => [...chatQueryKeys.details(), chatId] as const
};

export const chatsQueryOptions = (request: GetChatsRequest = {}) => {
  const params = normalizeListParams(request);

  return queryOptions({
    queryKey: chatQueryKeys.list(params),
    queryFn: ({ signal }) => getChats(params, signal),
    structuralSharing: mergeChatList,
    staleTime: 30_000
  });
};

export const chatByIdQueryOptions = (chatId: string) =>
  queryOptions({
    queryKey: chatQueryKeys.detail(chatId),
    queryFn: ({ signal }) => getChatById({ id: chatId }, signal),
    structuralSharing: mergeChat,
    enabled: Boolean(chatId),
    staleTime: 30_000
  });

export const chatsInfiniteQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: chatQueryKeys.infiniteList(size),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getChats({ page: pageParam, size }, signal),
    structuralSharing: mergeInfiniteChatList,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: 30_000
  });

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getChatById, getChats, type GetChatsRequest } from '@/utils/api';
import { mergeChat, mergeChatList, mergeInfiniteChatList } from '@/modules/chat';

const normalizeListParams = ({ page = 0, size = 20 }: GetChatsRequest = {}) => ({ page, size });

export const CHAT_QUERY_OPTIONS = {
  all: ['chats'] as const,
  lists: () => [...CHAT_QUERY_OPTIONS.all, 'list'] as const,
  list: (params: Required<GetChatsRequest>) => [...CHAT_QUERY_OPTIONS.lists(), params] as const,
  infiniteList: (size: number) => [...CHAT_QUERY_OPTIONS.lists(), 'infinite', { size }] as const,
  details: () => [...CHAT_QUERY_OPTIONS.all, 'detail'] as const,
  detail: (chatId: string) => [...CHAT_QUERY_OPTIONS.details(), chatId] as const
};

export const chatsQueryOptions = (request: GetChatsRequest = {}) => {
  const params = normalizeListParams(request);

  return queryOptions({
    queryKey: CHAT_QUERY_OPTIONS.list(params),
    queryFn: ({ signal }) => getChats(params, signal),
    structuralSharing: mergeChatList,
    staleTime: 30_000
  });
};

export const chatByIdQueryOptions = (chatId: string) =>
  queryOptions({
    queryKey: CHAT_QUERY_OPTIONS.detail(chatId),
    queryFn: ({ signal }) => getChatById({ id: chatId }, signal),
    structuralSharing: mergeChat,
    enabled: Boolean(chatId),
    staleTime: 30_000
  });

export const chatsInfiniteQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: CHAT_QUERY_OPTIONS.infiniteList(size),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getChats({ page: pageParam, size }, signal),
    structuralSharing: mergeInfiniteChatList,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: 30_000
  });

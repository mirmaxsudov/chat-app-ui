import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { chatByIdQueryOptions } from '@/modules/chat';
import { chatMessagesInfiniteQueryOptions } from '@/modules/message';
import { usePresenceStore } from '@/modules/presence';
import { postSendMessage } from '@/utils/api';

import { applyMessageToCache } from '../helpers/chat-cache';
import { chronologicalMessages, toChatSummary } from '../helpers/chat-view';
import { requestErrorMessage } from '../helpers/request-error';

export const useChatConversation = (chatId: string) => {
  const presenceByUserId = usePresenceStore((state) => state.byUserId);
  const queryClient = useQueryClient();
  const chat = useQuery({ ...chatByIdQueryOptions(chatId), meta: { withoutToastOnError: true } });
  const historyOptions = chatMessagesInfiniteQueryOptions({ chatId });
  const history = useInfiniteQuery({
    ...historyOptions,
    enabled: chat.isSuccess,
    meta: { withoutToastOnError: true }
  });
  const messages = useMemo(() => chronologicalMessages(history.data?.pages ?? []), [history.data]);

  const send = useMutation({
    mutationFn: ({ text, attachments }: { text: string; attachments: string[] }) =>
      postSendMessage({
        chatId,
        data: {
          text,
          attachments: attachments.map((id, sortOrder) => ({ id, sortOrder }))
        }
      }),
    retry: false,
    meta: { withoutToastOnError: true },
    onSuccess: (message) => applyMessageToCache(queryClient, chatId, message)
  });

  return {
    chat: chat.data
      ? toChatSummary(chat.data, presenceByUserId[chat.data.peer.id] ?? chat.data.peerPresence)
      : undefined,
    chatError: chat.isError ? requestErrorMessage() : undefined,
    chatLoading: chat.isPending,
    hasMoreMessages: history.hasNextPage,
    loadingMoreMessages: history.isFetchingNextPage,
    loadMoreMessages: () => {
      if (!history.isFetching) void history.fetchNextPage();
    },
    messages,
    messagesError: history.isError ? requestErrorMessage() : undefined,
    messagesLoading: history.isPending,
    retryChat: () => {
      void chat.refetch();
    },
    retryMessages: () => {
      void (history.isFetchNextPageError ? history.fetchNextPage() : history.refetch());
    },
    refreshPendingPreviews: async () => {
      if (history.isFetching) return;
      await history.refetch({ cancelRefetch: false });
    },
    sendError: send.isError ? requestErrorMessage() : undefined,
    sending: send.isPending,
    sendMessage: async (text: string, attachments: string[]) => {
      try {
        await send.mutateAsync({ text, attachments });
        return true;
      } catch {
        return false;
      }
    }
  };
};

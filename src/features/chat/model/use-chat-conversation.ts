import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthSession } from '@/features/auth/session';
import { chatMessagesInfiniteQueryOptions, postSendMessage } from '@/features/message';
import { chatByIdQueryOptions } from '../api';
import { applyMessageToCache } from './chat-cache';
import { chronologicalMessages, toChatSummary } from './chat-view';
import { requestErrorMessage } from './request-error';
import { usePresenceStore } from '../presence/presence-store';

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
    onMutate: () => ({ accessToken: getAuthSession()?.accessToken }),
    onSuccess: (message, _variables, context) => {
      if (context?.accessToken === getAuthSession()?.accessToken)
        applyMessageToCache(queryClient, chatId, message);
    }
  });

  return {
    chat: chat.data
      ? toChatSummary(chat.data, presenceByUserId[chat.data.peer.id] ?? chat.data.peerPresence)
      : undefined,
    chatError: chat.isError
      ? requestErrorMessage(chat.error, 'Unable to load this chat.')
      : undefined,
    chatLoading: chat.isPending,
    hasMoreMessages: history.hasNextPage,
    loadingMoreMessages: history.isFetchingNextPage,
    loadMoreMessages: () => {
      if (!history.isFetching) void history.fetchNextPage();
    },
    messages,
    messagesError: history.isError
      ? requestErrorMessage(history.error, 'Unable to load messages.')
      : undefined,
    messagesLoading: history.isPending,
    retryChat: () => {
      void chat.refetch();
    },
    retryMessages: () => {
      void (history.isFetchNextPageError ? history.fetchNextPage() : history.refetch());
    },
    sendError: send.isError
      ? requestErrorMessage(send.error, 'Message was not sent. Please try again.')
      : undefined,
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

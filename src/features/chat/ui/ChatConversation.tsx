import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import {
  chatMessagesInfiniteQueryOptions,
  messageQueryKeys,
  postSendMessage
} from '@/features/message';
import { insertConfirmedMessage } from '@/features/message/model/message-cache';
import { chatByIdQueryOptions, chatQueryKeys } from '../api';
import { chronologicalMessages, toChatSummary } from '../model/chat-view';
import { requestErrorMessage } from '../model/request-error';
import { ChatDetails } from './ChatDetails';
import { ChatHeader } from './ChatHeader';
import { MessageComposer } from './MessageComposer';
import { MessageTimeline } from './MessageTimeline';
import { RequestState } from './RequestState';

export const ChatConversation = ({ chatId, onBack }: { chatId: string; onBack: () => void }) => {
  const queryClient = useQueryClient();
  const [showDetails, setShowDetails] = useState(false);
  const chat = useQuery({ ...chatByIdQueryOptions(chatId), meta: { withoutToastOnError: true } });
  const historyOptions = chatMessagesInfiniteQueryOptions({ chatId });
  const history = useInfiniteQuery({
    ...historyOptions,
    enabled: chat.isSuccess,
    refetchInterval: 15_000,
    meta: { withoutToastOnError: true }
  });
  const messages = useMemo(() => chronologicalMessages(history.data?.pages ?? []), [history.data]);

  const send = useMutation({
    mutationFn: (text: string) => postSendMessage({ chatId, data: { text } }),
    retry: false,
    meta: { withoutToastOnError: true },
    onSuccess: async (message) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.byChat(chatId) });
      queryClient.setQueryData(historyOptions.queryKey, (old) =>
        insertConfirmedMessage(old, message)
      );
      queryClient.setQueryData(chatByIdQueryOptions(chatId).queryKey, (old) =>
        old && (!old.lastMessage || old.lastMessage.seq <= message.seq)
          ? { ...old, lastMessage: message, updatedAt: message.createdAt }
          : old
      );
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.byChat(chatId) });
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.lists() });
    }
  });

  if (chat.isPending || chat.isError) {
    return (
      <section className='flex min-h-0 flex-1 flex-col bg-[#dce8e5]'>
        <Button variant='ghost' className='m-3 self-start' onClick={onBack}>
          Back to conversations
        </Button>
        <RequestState
          loading={chat.isPending}
          message={
            chat.isError
              ? requestErrorMessage(chat.error, 'Unable to load this chat.')
              : 'Loading chat…'
          }
          onRetry={
            chat.isError
              ? () => {
                  void chat.refetch();
                }
              : undefined
          }
        />
      </section>
    );
  }

  const summary = toChatSummary(chat.data);
  return (
    <div className='relative flex h-full min-h-0 min-w-0 flex-1'>
      <section className='flex min-h-0 min-w-0 flex-1 flex-col'>
        <ChatHeader
          chat={summary}
          onBack={onBack}
          onToggleDetails={() => setShowDetails((open) => !open)}
        />
        <MessageTimeline
          messages={messages}
          loading={history.isPending}
          error={
            history.isError
              ? requestErrorMessage(history.error, 'Unable to load messages.')
              : undefined
          }
          onRetry={() => {
            void (history.isFetchNextPageError ? history.fetchNextPage() : history.refetch());
          }}
          hasMore={history.hasNextPage}
          loadingMore={history.isFetchingNextPage}
          onLoadMore={() => {
            if (!history.isFetching) void history.fetchNextPage();
          }}
        />
        <MessageComposer
          isSending={send.isPending}
          disabled={!history.isSuccess}
          error={
            send.isError
              ? requestErrorMessage(send.error, 'Message was not sent. Please try again.')
              : undefined
          }
          onSend={async (text) => {
            try {
              await send.mutateAsync(text);
              return true;
            } catch {
              return false;
            }
          }}
        />
      </section>
      {showDetails && (
        <div className='xl:w-[310px] xl:shrink-0'>
          <ChatDetails chat={summary} onClose={() => setShowDetails(false)} />
        </div>
      )}
    </div>
  );
};

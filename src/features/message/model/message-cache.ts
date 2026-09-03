import type { InfiniteData } from '@tanstack/react-query';
import type { ChatMessage } from './message.types';
import type { ApiMessagesResponse } from './message.response.types';

// Merge only server-confirmed messages. Preserve cursors so older history remains pageable.
export const insertConfirmedMessage = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined,
  message: ChatMessage
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined => {
  if (!history || !history.pages.length) return history;
  return {
    ...history,
    pages: history.pages.map((page, index) => ({
      ...page,
      messages: [
        ...(index === 0 ? [message] : []),
        ...page.messages.filter((item) => item.id !== message.id)
      ].sort((a, b) => b.seq - a.seq)
    }))
  };
};

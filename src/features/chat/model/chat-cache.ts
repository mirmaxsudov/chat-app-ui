import { replaceEqualDeep, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import type { ChatMessage } from '@/features/message/model/message.types';
import type { ApiMessagesResponse } from '@/features/message/model/message.response.types';
import {
  insertConfirmedMessages,
  mergeConfirmedMessage
} from '@/features/message/model/message-cache';
import type { Chat } from './chat.types';
import type { ChatsResponse } from './chat.response.types';

export const withLastMessage = (chat: Chat, message: ChatMessage): Chat => {
  if (chat.lastMessage && chat.lastMessage.seq > message.seq) return chat;
  if (chat.lastMessage?.seq === message.seq)
    return replaceEqualDeep(chat, {
      ...chat,
      lastMessage: mergeConfirmedMessage(chat.lastMessage, message)
    });
  return replaceEqualDeep(chat, { ...chat, lastMessage: message, updatedAt: message.createdAt });
};

export const mergeChat = (previous: unknown, incoming: unknown): Chat => {
  const old = previous as Chat | undefined;
  const next = incoming as Chat;
  return replaceEqualDeep(old, old?.lastMessage ? withLastMessage(next, old.lastMessage) : next);
};

// Reorder only the loaded window, keeping its page sizes and server pagination metadata.
const orderChats = (chats: Chat[]) =>
  chats.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id));

export const mergeChatList = (previous: unknown, incoming: unknown): ChatsResponse => {
  const old = previous as ChatsResponse | undefined;
  const next = incoming as ChatsResponse;
  const byId = new Map(old?.results.map((chat) => [chat.id, chat]));
  return replaceEqualDeep(old, {
    ...next,
    results: orderChats(next.results.map((chat) => mergeChat(byId.get(chat.id), chat)))
  });
};

export const mergeInfiniteChatList = (
  previous: unknown,
  incoming: unknown
): InfiniteData<ChatsResponse> => {
  const old = previous as InfiniteData<ChatsResponse> | undefined;
  const next = incoming as InfiniteData<ChatsResponse>;
  const byId = new Map(old?.pages.flatMap((page) => page.results).map((chat) => [chat.id, chat]));
  const results = orderChats(
    next.pages.flatMap((page) => page.results).map((chat) => mergeChat(byId.get(chat.id), chat))
  );
  let offset = 0;
  return replaceEqualDeep(old, {
    ...next,
    pages: next.pages.map((page) => {
      const slice = results.slice(offset, offset + page.results.length);
      offset += page.results.length;
      return { ...page, results: slice };
    })
  });
};

/** Shared by REST sends and the private queue. No refetch per ordinary message. */
export const applyMessageToCache = (client: QueryClient, chatId: string, message: ChatMessage) => {
  applyMessagesToCache(client, chatId, [message]);
};

export const applyMessagesToCache = (
  client: QueryClient,
  chatId: string,
  messages: ChatMessage[]
) => {
  if (!messages.length) return;
  const message = messages.reduce((latest, item) => (item.seq > latest.seq ? item : latest));
  client.setQueryData<Chat>(
    ['chats', 'detail', chatId],
    (old) => old && withLastMessage(old, message)
  );
  client.setQueriesData<InfiniteData<ApiMessagesResponse>>(
    { queryKey: ['messages', 'chat', chatId, 'infinite'] },
    (old) =>
      insertConfirmedMessages(old, messages) ?? {
        pages: [
          {
            messages: [...messages].sort((a, b) => b.seq - a.seq),
            hasMore: true,
            nextBeforeSeq: Math.min(...messages.map((item) => item.seq))
          }
        ],
        pageParams: [undefined]
      }
  );
  // Cursor-bounded historical snapshots must never receive a newer message.
  client.setQueriesData<ApiMessagesResponse>(
    {
      queryKey: ['messages', 'chat', chatId, 'history'],
      predicate: (query) => !(query.queryKey[4] as { beforeSeq?: number }).beforeSeq
    },
    (old) => {
      if (!old) return old;
      const byId = new Map(old.messages.map((item) => [item.id, item]));
      for (const message of messages) {
        const existing = byId.get(message.id);
        byId.set(message.id, existing ? mergeConfirmedMessage(existing, message) : message);
      }
      return replaceEqualDeep(old, {
        ...old,
        messages: [...byId.values()].sort((a, b) => b.seq - a.seq)
      });
    }
  );
  for (const query of client.getQueryCache().findAll({ queryKey: ['chats', 'list'] })) {
    if (query.queryKey[2] === 'infinite') {
      client.setQueryData<InfiniteData<ChatsResponse>>(
        query.queryKey,
        (old) =>
          old &&
          mergeInfiniteChatList(old, {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((chat) =>
                chat.id === chatId ? withLastMessage(chat, message) : chat
              )
            }))
          })
      );
    } else {
      client.setQueryData<ChatsResponse>(
        query.queryKey,
        (old) =>
          old &&
          mergeChatList(old, {
            ...old,
            results: old.results.map((chat) =>
              chat.id === chatId ? withLastMessage(chat, message) : chat
            )
          })
      );
    }
  }
};

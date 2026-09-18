import { replaceEqualDeep, type InfiniteData } from '@tanstack/react-query';
import type { ChatMessage } from './message.types';
import type { ApiMessagesResponse } from './message.response.types';

/** Prefer newly generated attachment metadata without letting a stale echo clear it again. */
export const mergeConfirmedMessage = (
  previous: ChatMessage,
  incoming: ChatMessage
): ChatMessage => {
  if (previous.id !== incoming.id) return incoming;
  const attachments = incoming.attachments ?? previous.attachments;
  if (!attachments) return replaceEqualDeep(previous, incoming);
  const previousAttachments = new Map(
    (previous.attachments ?? []).map((item) => [item.sortOrder, item.attachment])
  );
  return replaceEqualDeep(previous, {
    ...incoming,
    attachments: attachments.map((item) => {
      const existing = previousAttachments.get(item.sortOrder);
      return !item.attachment.thumbnailURL && existing?.thumbnailURL
        ? { ...item, attachment: { ...item.attachment, thumbnailURL: existing.thumbnailURL } }
        : item;
    })
  });
};

// Merge only server-confirmed messages. Preserve cursors so older history remains pageable.
export const insertConfirmedMessage = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined,
  message: ChatMessage
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined => {
  return insertConfirmedMessages(history, [message]);
};

export const insertConfirmedMessages = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined,
  incoming: ChatMessage[]
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined => {
  if (!history || !history.pages.length) return history;
  // A message can be delivered again after asynchronous attachment processing. Upsert it so
  // generated thumbnail metadata reaches the UI; replaceEqualDeep keeps identical echoes a no-op.
  const existingIds = new Set(
    history.pages.flatMap((page) => page.messages.map((message) => message.id))
  );
  const byId = new Map(incoming.map((message) => [message.id, message]));
  const added = [...byId.values()].filter((message) => !existingIds.has(message.id));
  return replaceEqualDeep(history, {
    ...history,
    pages: history.pages.map((page, index) => ({
      ...page,
      messages: [
        ...(index === 0 ? added : []),
        ...page.messages.map((message) => {
          const updated = byId.get(message.id);
          return updated ? mergeConfirmedMessage(message, updated) : message;
        })
      ].sort((a, b) => b.seq - a.seq)
    }))
  });
};

/** Keep loaded history and live arrivals when an older HTTP snapshot finishes later.
 * Re-page the union so a long-running connection cannot grow the newest page forever.
 * The oldest covered response owns the final cursor; an event alone is not a snapshot.
 */
export const mergeMessageHistory = (
  previous: unknown,
  incoming: unknown,
  size: number
): InfiniteData<ApiMessagesResponse, number | undefined> => {
  const old = previous as InfiniteData<ApiMessagesResponse, number | undefined> | undefined;
  const next = incoming as InfiniteData<ApiMessagesResponse, number | undefined>;
  if (old === next) return next;
  const messages = new Map<string, ChatMessage>();
  for (const source of [old, next])
    for (const page of source?.pages ?? [])
      for (const message of page.messages) messages.set(message.id, message);
  const sorted = [...messages.values()].sort((a, b) => b.seq - a.seq);
  if (!sorted.length) return replaceEqualDeep(old, next);

  const oldest = sorted.at(-1)!.seq;
  const complete = [old, next].some((source) =>
    source?.pages.some(
      (page) => !page.hasMore && page.messages.some((message) => message.seq === oldest)
    )
  );
  const pages: ApiMessagesResponse[] = [];
  const pageParams: (number | undefined)[] = [];
  for (let offset = 0; offset < sorted.length; offset += size) {
    const chunk = sorted.slice(offset, offset + size);
    const hasMore = offset + size < sorted.length || !complete;
    pageParams.push(offset === 0 ? undefined : sorted[offset - 1].seq);
    pages.push({ messages: chunk, hasMore, nextBeforeSeq: hasMore ? chunk.at(-1)!.seq : null });
  }
  return replaceEqualDeep(old, { pages, pageParams });
};

export const mergeLatestMessages = (
  previous: unknown,
  incoming: unknown,
  size: number
): ApiMessagesResponse => {
  const old = previous as ApiMessagesResponse | undefined;
  const next = incoming as ApiMessagesResponse;
  if (old === next) return next;
  const byId = new Map(
    [...(old?.messages ?? []), ...next.messages].map((message) => [message.id, message])
  );
  const messages = [...byId.values()].sort((a, b) => b.seq - a.seq).slice(0, size);
  const hasMore = next.hasMore || byId.size > size;
  return replaceEqualDeep(old, {
    ...next,
    messages,
    hasMore,
    nextBeforeSeq: hasMore ? (messages.at(-1)?.seq ?? next.nextBeforeSeq) : null
  });
};

import type { InfiniteData } from '@tanstack/react-query';

import { replaceEqualDeep } from '@tanstack/react-query';

const CACHE_REPLACEMENT = '__replace  MessageHistory' as const;
const REMOVED_MESSAGE_IDS = '__removedMessageIds' as const;

type MessageHistoryCacheReplacement<TPageParam> = InfiniteData<ApiMessagesResponse, TPageParam> & {
  [CACHE_REPLACEMENT]?: true;
  [REMOVED_MESSAGE_IDS]?: string[];
};

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

  const previewProgress = {
    NOT_APPLICABLE: 0,
    PENDING: 1,
    PROCESSING: 2,
    FAILED: 3,
    READY: 4
  } as const;

  return replaceEqualDeep(previous, {
    ...incoming,
    attachments: attachments.map((item) => {
      const existing = previousAttachments.get(item.sortOrder);
      if (!existing) return item;

      const existingPreview = existing.preview;
      const incomingPreview = item.attachment.preview;
      const preview =
        existingPreview &&
        (!incomingPreview ||
          previewProgress[existingPreview.status] > previewProgress[incomingPreview.status])
          ? existingPreview
          : incomingPreview;

      return {
        ...item,
        attachment: {
          ...item.attachment,
          thumbnailURL: item.attachment.thumbnailURL ?? existing.thumbnailURL,
          preview
        }
      };
    })
  });
};

// Merge only server-confirmed messages. Preserve cursors so older history remains pageable.
export const insertConfirmedMessage = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined,
  message: ChatMessage
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined =>
  insertConfirmedMessages(history, [message]);

export const insertConfirmedMessages = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined,
  incoming: ChatMessage[]
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined => {
  if (!history || !history.pages.length) return history;
  const cache = history as MessageHistoryCacheReplacement<TPageParam>;
  const removedIds = new Set(cache[REMOVED_MESSAGE_IDS] ?? []);
  // A message can be delivered again after asynchronous attachment processing. Upsert it so
  // generated thumbnail metadata reaches the UI. Ignore delayed echoes of deleted messages.
  const existingIds = new Set(
    history.pages.flatMap((page) =>
      page.messages.filter((message) => !removedIds.has(message.id)).map((message) => message.id)
    )
  );
  const byId = new Map(
    incoming
      .filter((message) => !removedIds.has(message.id))
      .map((message) => [message.id, message])
  );
  const added = [...byId.values()].filter((message) => !existingIds.has(message.id));
  return replaceEqualDeep(history, {
    ...history,
    pages: history.pages.map((page, index) => ({
      ...page,
      messages: [
        ...(index === 0 ? added : []),
        ...page.messages
          .filter((message) => !removedIds.has(message.id))
          .map((message) => {
            const updated = byId.get(message.id);
            return updated ? mergeConfirmedMessage(message, updated) : message;
          })
      ].sort((a, b) => b.seq - a.seq)
    }))
  });
};

/** Force an exact cache replacement, used to restore the pre-mutation snapshot on failure. */
export const replaceMessageHistory = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined =>
  history
    ? ({ ...history, [CACHE_REPLACEMENT]: true } as MessageHistoryCacheReplacement<TPageParam>)
    : history;

/** Remove a message from every loaded page while preserving pagination cursors. */
export const removeMessageFromHistory = <TPageParam = unknown>(
  history: InfiniteData<ApiMessagesResponse, TPageParam> | undefined,
  messageId: string
): InfiniteData<ApiMessagesResponse, TPageParam> | undefined => {
  if (!history) return history;

  const cache = history as MessageHistoryCacheReplacement<TPageParam>;
  const removedIds = new Set(cache[REMOVED_MESSAGE_IDS] ?? []);
  removedIds.add(messageId);

  const replacement: MessageHistoryCacheReplacement<TPageParam> = {
    ...history,
    [CACHE_REPLACEMENT]: true,
    [REMOVED_MESSAGE_IDS]: [...removedIds],
    pages: history.pages.map((page) => ({
      ...page,
      messages: page.messages.filter((message) => message.id !== messageId)
    }))
  };

  return replacement;
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
  const old = previous as MessageHistoryCacheReplacement<number | undefined> | undefined;
  const next = incoming as MessageHistoryCacheReplacement<number | undefined>;

  if (next[CACHE_REPLACEMENT]) {
    const { [CACHE_REPLACEMENT]: _replacement, ...replacement } = next;
    return replaceEqualDeep(old, replacement);
  }

  if (old === next) return next;
  const removedIds = new Set([
    ...(old?.[REMOVED_MESSAGE_IDS] ?? []),
    ...(next[REMOVED_MESSAGE_IDS] ?? [])
  ]);
  const messages = new Map<string, ChatMessage>();
  for (const source of [old, next])
    for (const page of source?.pages ?? [])
      for (const message of page.messages)
        if (!removedIds.has(message.id)) messages.set(message.id, message);
  const sorted = [...messages.values()].sort((a, b) => b.seq - a.seq);
  if (!sorted.length)
    return replaceEqualDeep(old, {
      ...next,
      pages: next.pages.map((page) => ({ ...page, messages: [] })),
      ...(removedIds.size ? { [REMOVED_MESSAGE_IDS]: [...removedIds] } : {})
    });

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
  return replaceEqualDeep(old, {
    pages,
    pageParams,
    ...(removedIds.size ? { [REMOVED_MESSAGE_IDS]: [...removedIds] } : {})
  });
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

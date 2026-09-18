import { notifyManager, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { getChatMessages } from '@/features/message/api/message.api';
import type { ApiMessagesResponse } from '@/features/message/model/message.response.types';
import type { Chat } from '../model/chat.types';
import type { ChatsResponse } from '../model/chat.response.types';
import { chatByIdQueryOptions, chatQueryKeys } from '@/features/chat';
import { applyMessagesToCache, applyMessageToCache } from '../model/chat-cache';
import type { RealtimeMessageEvent } from './event';
import { presenceStore } from '../presence/presence-store';

type History = InfiniteData<ApiMessagesResponse>;

const historyGap = (history: History | undefined) => {
  let previous: number | undefined;
  let boundary: number | undefined;
  for (const page of history?.pages ?? []) {
    for (const message of page.messages) {
      if (previous !== undefined && previous > message.seq + 1) boundary = message.seq;
      previous = message.seq;
    }
  }
  return boundary;
};

/** One synchronizer per authenticated session. Owns cancellable REST recovery and burst batching. */
export const createChatSynchronizer = (client: QueryClient, isCurrent: () => boolean) => {
  const controller = new AbortController();
  const pending = new Map<string, RealtimeMessageEvent>();
  const recovering = new Map<
    string,
    { boundary: number | undefined; started: boolean; rerun: boolean; run: () => Promise<void> }
  >();
  const applyingRecovery = new Set<string>();
  const metadata = new Map<string, RealtimeMessageEvent['message']>();
  let running = 0;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let listTimer: ReturnType<typeof setTimeout> | undefined;
  const current = () => !controller.signal.aborted && isCurrent();
  const histories = (chatId?: string) =>
    client.getQueryCache().findAll({
      queryKey: chatId ? ['messages', 'chat', chatId, 'infinite'] : ['messages'],
      predicate: (query) => query.queryKey[3] === 'infinite'
    });

  const receivePresenceFromQuery = (data: unknown) => {
    if (!data) return;
    if (Array.isArray((data as InfiniteData<ChatsResponse>).pages)) {
      presenceStore().receiveChats(
        (data as InfiniteData<ChatsResponse>).pages.flatMap((page) => page.results)
      );
      return;
    }
    if (Array.isArray((data as ChatsResponse).results)) {
      presenceStore().receiveChats((data as ChatsResponse).results);
      return;
    }
    if ((data as Chat).peer) presenceStore().receiveChats([data as Chat]);
  };

  for (const query of client.getQueryCache().findAll({ queryKey: chatQueryKeys.all }))
    receivePresenceFromQuery(query.state.data);

  const latest = (chatId: string) => {
    const sequences = histories(chatId)
      .map((query) => (query.state.data as History | undefined)?.pages[0]?.messages[0]?.seq)
      .filter((seq): seq is number => seq !== undefined);
    return sequences.length ? Math.min(...sequences) : undefined;
  };

  const refreshLists = () => {
    if (listTimer || !current()) return;
    listTimer = setTimeout(() => {
      listTimer = undefined;
      if (current())
        void client.invalidateQueries(
          { queryKey: chatQueryKeys.lists() },
          { cancelRefetch: false }
        );
    }, 150);
  };

  const pump = () => {
    if (!current()) return;
    for (const job of recovering.values()) {
      if (running >= 3) break;
      if (job.started) continue;
      job.started = true;
      running++;
      void job.run().finally(() => {
        running--;
        pump();
      });
    }
  };

  const recover = (chatId: string, boundary = latest(chatId)) => {
    const existing = recovering.get(chatId);
    if (existing) {
      if (boundary !== undefined)
        existing.boundary = Math.min(existing.boundary ?? boundary, boundary);
      // A gap can arrive after this job already fetched its newest snapshot.
      existing.rerun ||= existing.started;
      return;
    }
    const job = {
      boundary,
      started: false,
      rerun: false,
      run: async () => {
        try {
          let beforeSeq: number | undefined;
          const pages: ApiMessagesResponse[] = [];
          const pageParams: (number | undefined)[] = [];
          do {
            const page = await getChatMessages({ chatId, size: 100, beforeSeq }, controller.signal);
            if (!current()) return;
            pages.push(page);
            pageParams.push(beforeSeq);
            const oldest = page.messages.at(-1)?.seq;
            if (
              !page.hasMore ||
              job.boundary === undefined ||
              (oldest !== undefined && oldest <= job.boundary)
            )
              break;
            const cursor = page.nextBeforeSeq;
            if (cursor === null || (beforeSeq !== undefined && cursor >= beforeSeq))
              throw new Error('Non-advancing history cursor');
            beforeSeq = cursor;
          } while (current());
          if (!current()) return;
          // Merge once per recovery, not once per recovered message. Query structuralSharing
          // retains live arrivals, loaded older pages, and their coverage during this request.
          applyingRecovery.add(chatId);
          try {
            notifyManager.batch(() => {
              for (const query of histories(chatId))
                client.setQueryData(query.queryKey, { pages, pageParams });
              const newest = pages[0]?.messages[0];
              if (newest) applyMessageToCache(client, chatId, newest);
            });
          } finally {
            applyingRecovery.delete(chatId);
          }
          if (job.rerun) {
            const gaps = histories(chatId)
              .map((query) => historyGap(query.state.data as History | undefined))
              .filter((seq): seq is number => seq !== undefined);
            job.rerun = gaps.length > 0;
            if (gaps.length) job.boundary = Math.min(...gaps);
          }
        } catch {
          // Offline/transport failures are retried on reconnect, focus, or the safety sweep.
          // REST 401 is handled centrally by the API client.
          if (current())
            void client.invalidateQueries({
              queryKey: ['messages', 'chat', chatId],
              refetchType: 'none'
            });
        } finally {
          recovering.delete(chatId);
          if (job.rerun && current()) recover(chatId, job.boundary);
        }
      }
    };
    recovering.set(chatId, job);
    pump();
  };
  const loadUnknownChat = (chatId: string, message: RealtimeMessageEvent['message']) => {
    const pendingMessage = metadata.get(chatId);
    if (pendingMessage) {
      if (message.seq > pendingMessage.seq) metadata.set(chatId, message);
      return;
    }
    const known =
      client.getQueryData<Chat>(chatQueryKeys.detail(chatId)) ||
      client
        .getQueriesData<ChatsResponse | InfiniteData<ChatsResponse>>({
          queryKey: chatQueryKeys.lists()
        })
        .some(
          ([, data]) =>
            data &&
            ('pages' in data ? data.pages.flatMap((page) => page.results) : data.results).some(
              (chat) => chat.id === chatId
            )
        );
    if (known) return;
    metadata.set(chatId, message);
    // fetchQuery coalesces with any detail query already mounted by the UI.
    void client
      .fetchQuery({ ...chatByIdQueryOptions(chatId), meta: { withoutToastOnError: true } })
      .then(() => {
        if (current()) {
          const latestMessage = metadata.get(chatId);
          if (latestMessage) applyMessageToCache(client, chatId, latestMessage);
          refreshLists();
        }
      })
      .catch(() => {
        if (current()) refreshLists();
      })
      .finally(() => metadata.delete(chatId));
  };
  const flush = () => {
    flushTimer = undefined;
    if (!current()) {
      pending.clear();
      return;
    }
    const events = [...pending.values()];
    pending.clear();
    notifyManager.batch(() => {
      // Sequence ordering avoids unnecessary gap recovery for out-of-order frames in a burst.
      events.sort((a, b) => a.message.seq - b.message.seq);
      const byChat = new Map<string, RealtimeMessageEvent['message'][]>();
      for (const event of events) {
        const messages = byChat.get(event.chatId) ?? [];
        messages.push(event.message);
        byChat.set(event.chatId, messages);
      }
      for (const [chatId, messages] of byChat) {
        applyMessagesToCache(client, chatId, messages);
        loadUnknownChat(chatId, messages.at(-1)!);
      }
    });
  };
  // Detect a gap introduced when an initial/stale HTTP response finishes after live
  // arrivals. No assumption that a single latest page covers an arbitrary disconnect.
  const unsubscribe = client.getQueryCache().subscribe((event) => {
    if (
      !current() ||
      event.type !== 'updated' ||
      event.action.type !== 'success' ||
      (event.query.queryKey[0] !== 'messages' && event.query.queryKey[0] !== 'chats')
    )
      return;
    if (event.query.queryKey[0] === 'chats') receivePresenceFromQuery(event.query.state.data);
    if (event.query.queryKey[0] === 'chats') {
      // An initial list snapshot may have started before an unknown-chat event.
      // Metadata and list requests may finish in either order.
      if (event.action.manual || event.query.queryKey[1] !== 'list') return;
      const data = event.query.state.data as ChatsResponse | InfiniteData<ChatsResponse>;
      const chats = 'pages' in data ? data.pages.flatMap((page) => page.results) : data.results;
      notifyManager.batch(() => {
        for (const chat of chats) {
          const detail = client.getQueryData<Chat>(chatQueryKeys.detail(chat.id));
          if (detail?.lastMessage && detail.lastMessage.seq > (chat.lastMessage?.seq ?? 0))
            applyMessageToCache(client, chat.id, detail.lastMessage);
        }
      });
      return;
    }
    if (
      event.query.queryKey[3] !== 'infinite' ||
      applyingRecovery.has(event.query.queryKey[2] as string)
    )
      return;
    const boundary = historyGap(event.query.state.data as History | undefined);
    if (boundary !== undefined) recover(event.query.queryKey[2] as string, boundary);
  });
  return {
    receive(event: RealtimeMessageEvent) {
      if (!current()) return;
      pending.set(`${event.chatId}:${event.message.id}`, event);
      if (!flushTimer) flushTimer = setTimeout(flush, 25);
      if (pending.size >= 500) {
        clearTimeout(flushTimer);
        flush();
      }
    },
    reconcile(activeOnly = false) {
      if (!current()) return;
      refreshLists();
      void client.invalidateQueries(
        { queryKey: chatQueryKeys.details(), refetchType: 'active' },
        { cancelRefetch: false }
      );
      const ids = new Set(
        histories()
          .filter((query) => query.state.data && (!activeOnly || query.isActive()))
          .map((query) => query.queryKey[2] as string)
      );
      for (const chatId of ids) recover(chatId);
    },
    dispose() {
      controller.abort();
      unsubscribe();
      clearTimeout(flushTimer);
      clearTimeout(listTimer);
      pending.clear();
      recovering.clear();
      metadata.clear();
    }
  };
};

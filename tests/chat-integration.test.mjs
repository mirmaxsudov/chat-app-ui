import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { QueryClient } from '@tanstack/react-query';

// All transport is intercepted. These tests never contact the configured backend.
const server = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  server: { middlewareMode: true, ws: false },
  appType: 'custom'
});
after(() => server.close());

const { apiClient, setAccessTokenGetter } = await server.ssrLoadModule('/src/shared/api/client.ts');
const { chatsInfiniteQueryOptions, chatByIdQueryOptions } = await server.ssrLoadModule(
  '/src/features/chat/api/query-options.ts'
);
const { postDMChat, postSavedChat } = await server.ssrLoadModule(
  '/src/features/chat/api/chat.api.ts'
);
const { chatMessagesInfiniteQueryOptions } = await server.ssrLoadModule(
  '/src/features/message/api/query-options.ts'
);
const { postSendMessage } = await server.ssrLoadModule('/src/features/message/api/message.api.ts');
const { chronologicalMessages, toChatSummary } = await server.ssrLoadModule(
  '/src/features/chat/model/chat-view.ts'
);
const { insertConfirmedMessage } = await server.ssrLoadModule(
  '/src/features/message/model/message-cache.ts'
);

const message = (seq) => ({
  id: 'm-' + seq,
  seq,
  senderId: 'user',
  text: 'Message ' + seq,
  createdAt: '2026-09-03T10:00:00',
  mine: true
});
const chat = {
  id: 'chat-1',
  type: 'DIRECT',
  peer: { id: 'peer', username: 'tester', firstname: null, lastname: null },
  peerPresence: {
    userId: 'peer',
    status: 'ONLINE',
    lastSeenAt: null,
    changedAt: '2026-09-18T10:16:00Z'
  },
  lastMessage: null,
  createdAt: '2026-09-03T10:00:00',
  updatedAt: '2026-09-03T10:00:00'
};
const envelope = (data) => ({ success: true, message: 'OK', data });
const mockTransport = (handler) => {
  apiClient.defaults.adapter = async (config) => ({
    data: await handler(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  });
};
const client = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

test('chat views use API presence and never invent messages', () => {
  const summary = toChatSummary(chat);
  assert.equal(summary.name, 'tester');
  assert.equal(summary.message, 'No messages yet');
  assert.equal(summary.status, 'Direct chat');
  assert.equal(summary.presence.status, 'ONLINE');
  assert.equal('unread' in summary, false);
  const saved = toChatSummary({ ...chat, type: 'SAVED', peerPresence: null });
  assert.equal(saved.name, 'Saved Messages');
  assert.equal(saved.presence, null);
});

test('message history is chronological and deduplicates overlapping cursor pages', () => {
  const result = chronologicalMessages([
    { messages: [message(3), message(2)], nextBeforeSeq: 2, hasMore: true },
    { messages: [message(2), message(1)], nextBeforeSeq: null, hasMore: false }
  ]);
  assert.deepEqual(
    result.map((item) => item.seq),
    [1, 2, 3]
  );
});

test('confirmed sends preserve older-page cursors and cannot duplicate a message', () => {
  const history = {
    pages: [
      { messages: [message(2)], nextBeforeSeq: 2, hasMore: true },
      { messages: [message(1)], nextBeforeSeq: null, hasMore: false }
    ],
    pageParams: [undefined, 2]
  };
  const updated = insertConfirmedMessage(insertConfirmedMessage(history, message(3)), message(3));
  assert.deepEqual(
    updated.pages[0].messages.map((item) => item.seq),
    [3, 2]
  );
  assert.equal(updated.pages[0].nextBeforeSeq, 2);
  assert.deepEqual(updated.pageParams, [undefined, 2]);
  assert.deepEqual(
    history.pages[0].messages.map((item) => item.seq),
    [2]
  );
});

test('chat queries paginate through real request functions with a Bearer header', async () => {
  const calls = [];
  setAccessTokenGetter(() => 'test-only-token');
  mockTransport((config) => {
    calls.push(config);
    assert.equal(config.url, '/chats');
    assert.equal(config.headers.Authorization, 'Bearer test-only-token');
    return {
      success: true,
      message: 'OK',
      results: [{ ...chat, id: 'chat-' + config.params.page }],
      page: config.params.page,
      size: 20,
      total: 2,
      hasNext: config.params.page === 0,
      hasPrev: config.params.page > 0
    };
  });
  const queryClient = client();
  try {
    const data = await queryClient.fetchInfiniteQuery({ ...chatsInfiniteQueryOptions(), pages: 2 });
    assert.deepEqual(
      calls.map((call) => call.params.page),
      [0, 1]
    );
    assert.equal(data.pages.length, 2);
  } finally {
    queryClient.clear();
  }
});

test('message queries use beforeSeq and stop when hasMore is false', async () => {
  const calls = [];
  mockTransport((config) => {
    calls.push(config);
    assert.equal(config.url, '/chats/chat-1/messages');
    return envelope(
      config.params.beforeSeq === undefined
        ? { messages: [message(3), message(2)], nextBeforeSeq: 2, hasMore: true }
        : { messages: [message(1)], nextBeforeSeq: null, hasMore: false }
    );
  });
  const queryClient = client();
  try {
    const data = await queryClient.fetchInfiniteQuery({
      ...chatMessagesInfiniteQueryOptions({ chatId: 'chat-1', size: 2 }),
      pages: 5
    });
    assert.deepEqual(
      calls.map((call) => call.params.beforeSeq),
      [undefined, 2]
    );
    assert.deepEqual(
      chronologicalMessages(data.pages).map((item) => item.seq),
      [1, 2, 3]
    );
  } finally {
    queryClient.clear();
  }
});

test('detail/create/send operations unwrap server responses and send exact JSON', async () => {
  mockTransport((config) => {
    if (config.url === '/chats/dm') {
      assert.equal(config.method, 'post');
      assert.deepEqual(JSON.parse(config.data), { username: 'tester' });
      return envelope(chat);
    }
    if (config.url === '/chats/saved') return envelope({ ...chat, type: 'SAVED' });
    if (config.url === '/chats/chat-1/messages') {
      assert.deepEqual(JSON.parse(config.data), { text: 'Hello\nworld' });
      return envelope({ ...message(1), text: 'Hello\nworld' });
    }
    assert.equal(config.url, '/chats/chat-1');
    return envelope(chat);
  });
  const queryClient = client();
  try {
    assert.equal((await queryClient.fetchQuery(chatByIdQueryOptions('chat-1'))).id, chat.id);
    assert.equal((await postDMChat({ data: { username: 'tester' } })).id, chat.id);
    assert.equal((await postSavedChat()).type, 'SAVED');
    assert.equal(
      (await postSendMessage({ chatId: 'chat-1', data: { text: 'Hello\nworld' } })).text,
      'Hello\nworld'
    );
  } finally {
    queryClient.clear();
  }
});

test('request failures reject without inserting a locally fabricated message', async () => {
  mockTransport(() => {
    throw new Error('Network unavailable');
  });
  await assert.rejects(
    postSendMessage({ chatId: 'chat-1', data: { text: 'Unsent draft' } }),
    /Network unavailable/
  );
});

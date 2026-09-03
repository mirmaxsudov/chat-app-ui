import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'vite';
import { QueryClient } from '@tanstack/react-query';

// Transport and STOMP are isolated; no real credentials, sockets or account mutations.
const server = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  server: { middlewareMode: true, ws: false },
  appType: 'custom'
});

after(() => server.close());

const load = (path) => server.ssrLoadModule('/src/' + path);
const { parseMessageEvent } = await load('features/chat/realtime/event.ts');
const { startMessageConnection, resolveSockJsUrl } = await load(
  'features/chat/realtime/connection.ts'
);
const { createChatSynchronizer } = await load('features/chat/realtime/synchronizer.ts');
const { applyMessageToCache, applyMessagesToCache } = await load(
  'features/chat/model/chat-cache.ts'
);
const { chatMessagesInfiniteQueryOptions, chatMessagesQueryOptions } = await load(
  'features/message/api/query-options.ts'
);
const { chatsInfiniteQueryOptions, chatByIdQueryOptions } = await load(
  'features/chat/api/query-options.ts'
);
const { apiClient } = await load('shared/api/client.ts');
const chatId = '11111111-1111-4111-8111-111111111111';
const peerId = '33333333-3333-4333-8333-333333333333';
const message = (seq) => ({
  id: `22222222-2222-4222-8222-${String(seq).padStart(12, '0')}`,
  seq,
  senderId: peerId,
  text: `Message ${seq}`,
  createdAt: '2026-09-03T10:00:00.123456',
  mine: false
});
const event = (seq, id = chatId) => ({
  type: 'MESSAGE_CREATED',
  chatId: id,
  chatType: 'DIRECT',
  message: message(seq)
});
const chat = (id = chatId, seq = 1) => ({
  id,
  type: 'DIRECT',
  peer: { id: peerId, username: 'peer', firstname: null, lastname: null },
  lastMessage: message(seq),
  createdAt: '2026-09-03T10:00:00',
  updatedAt: '2026-09-03T10:00:00'
});
const page = (sequences, hasMore = false) => ({
  messages: sequences.map(message),
  hasMore,
  nextBeforeSeq: hasMore ? sequences.at(-1) : null
});
const list = (results, index = 0) => ({
  success: true,
  message: 'OK',
  results,
  total: results.length,
  page: index,
  size: 20,
  hasNext: false,
  hasPrev: index > 0
});
const envelope = (data) => ({ success: true, message: 'OK', data });
const client = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
const transport = (handler) => {
  apiClient.defaults.adapter = async (config) => ({
    data: await handler(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  });
};
const seedHistory = (queryClient, sequences, size = 50, id = chatId) => {
  const options = chatMessagesInfiniteQueryOptions({ chatId: id, size });
  queryClient.getQueryCache().build(queryClient, options);
  queryClient.setQueryData(options.queryKey, {
    pages: [page(sequences, sequences.at(-1) !== 1)],
    pageParams: [undefined]
  });
  return options;
};
const seqs = (queryClient, options) =>
  queryClient
    .getQueryData(options.queryKey)
    .pages.flatMap((page) => page.messages.map((message) => message.seq));
const eventually = async (predicate) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return;
    await delay(5);
  }
  assert.fail('Timed out waiting for isolated async work');
};

test('validates UUIDs, safe sequences and local dates; ignores malformed/future events', () => {
  assert.deepEqual(parseMessageEvent(JSON.stringify(event(42))), event(42));
  for (const body of [
    '{',
    '{}',
    JSON.stringify({ ...event(1), type: 'TYPING' }),
    JSON.stringify({ ...event(1), chatId: 'invalid' }),
    JSON.stringify(event(Number.MAX_SAFE_INTEGER + 1)),
    JSON.stringify({ ...event(1), message: { ...message(1), mine: 'false' } }),
    JSON.stringify({ ...event(1), message: { ...message(1), createdAt: 'yesterday' } })
  ])
    assert.equal(parseMessageEvent(body), null);
});

test('SockJS URL uses the API origin, supports an explicit proxy path and rejects ws://', () => {
  assert.equal(
    resolveSockJsUrl('https://api.example.com/api/v1', undefined, 'https://app.example.com'),
    'https://api.example.com/ws'
  );
  assert.equal(
    resolveSockJsUrl('/api/v1', undefined, 'https://app.example.com/chat'),
    'https://app.example.com/ws'
  );
  assert.equal(
    resolveSockJsUrl(undefined, '/gateway/ws', 'https://app.example.com/chat'),
    'https://app.example.com/gateway/ws'
  );
  assert.throws(() => resolveSockJsUrl(undefined, 'ws://localhost/ws', 'http://localhost'), /HTTP/);
});

test('REST/queue duplicates are idempotent and late snapshots preserve live and older history', async () => {
  const queryClient = client();
  try {
    const options = seedHistory(queryClient, [3, 2, 1], 2);
    applyMessageToCache(queryClient, chatId, message(4));
    const first = queryClient.getQueryData(options.queryKey);
    applyMessageToCache(queryClient, chatId, message(4));
    assert.equal(queryClient.getQueryData(options.queryKey), first);
    transport(() => envelope(page([3, 2], true)));
    await queryClient.fetchInfiniteQuery({ ...options, pages: 1 });
    assert.deepEqual(seqs(queryClient, options), [4, 3, 2, 1]);
    const data = queryClient.getQueryData(options.queryKey);
    assert.deepEqual(data.pageParams, [undefined, 3]);
    assert.equal(data.pages.at(-1).hasMore, false);
  } finally {
    queryClient.clear();
  }
});

test('previews do not regress and an event moves its chat across loaded page boundaries', () => {
  const queryClient = client();
  try {
    const options = chatsInfiniteQueryOptions();
    queryClient.getQueryCache().build(queryClient, options);
    queryClient.setQueryData(options.queryKey, {
      pages: [list([chat('other')]), list([chat()], 1)],
      pageParams: [0, 1]
    });
    queryClient.getQueryCache().build(queryClient, chatByIdQueryOptions(chatId));
    queryClient.setQueryData(chatByIdQueryOptions(chatId).queryKey, chat());
    applyMessageToCache(queryClient, chatId, message(5));
    applyMessageToCache(queryClient, chatId, message(4));
    const data = queryClient.getQueryData(options.queryKey);
    assert.equal(data.pages[0].results[0].id, chatId);
    assert.equal(data.pages[0].results[0].lastMessage.seq, 5);
    assert.deepEqual(data.pageParams, [0, 1]);
    queryClient.setQueryData(chatByIdQueryOptions(chatId).queryKey, chat());
    assert.equal(
      queryClient.getQueryData(chatByIdQueryOptions(chatId).queryKey).lastMessage.seq,
      5
    );
  } finally {
    queryClient.clear();
  }
});

test('only latest single-page queries receive events, not beforeSeq snapshots', async () => {
  const queryClient = client();
  try {
    const latest = chatMessagesQueryOptions({ chatId, size: 2 });
    const older = chatMessagesQueryOptions({ chatId, beforeSeq: 2, size: 2 });
    queryClient.getQueryCache().build(queryClient, latest);
    queryClient.getQueryCache().build(queryClient, older);
    queryClient.setQueryData(latest.queryKey, page([2, 1]));
    queryClient.setQueryData(older.queryKey, page([1]));
    applyMessageToCache(queryClient, chatId, message(3));
    transport(() => envelope(page([2, 1])));
    await queryClient.fetchQuery(latest);
    assert.deepEqual(
      queryClient.getQueryData(latest.queryKey).messages.map((item) => item.seq),
      [3, 2]
    );
    assert.deepEqual(
      queryClient.getQueryData(older.queryKey).messages.map((item) => item.seq),
      [1]
    );
  } finally {
    queryClient.clear();
  }
});

test('reconnect recovery walks more than one page and preserves events arriving during recovery', async () => {
  const queryClient = client();
  const options = seedHistory(queryClient, [2, 1]);
  const sync = createChatSynchronizer(queryClient, () => true);
  const cursors = [];
  try {
    transport((config) => {
      cursors.push(config.params.beforeSeq);
      const top = config.params.beforeSeq === undefined ? 252 : config.params.beforeSeq - 1;
      const bottom = Math.max(1, top - 99);
      return envelope(
        page(
          Array.from({ length: top - bottom + 1 }, (_, index) => top - index),
          bottom > 1
        )
      );
    });
    sync.reconcile();
    applyMessageToCache(queryClient, chatId, message(253));
    await eventually(() => seqs(queryClient, options).length === 253);
    assert.deepEqual(cursors, [undefined, 153, 53]);
    assert.deepEqual(
      seqs(queryClient, options),
      Array.from({ length: 253 }, (_, index) => 253 - index)
    );
  } finally {
    sync.dispose();
    queryClient.clear();
  }
});

test('events update the existing query cache in batches without HTTP per message', async () => {
  const queryClient = client();
  const options = seedHistory(queryClient, [1]);
  queryClient.setQueryData(chatByIdQueryOptions(chatId).queryKey, chat());
  const sync = createChatSynchronizer(queryClient, () => true);
  let requests = 0;
  let writes = 0;
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.queryKey[0] === 'messages') writes++;
  });
  transport(() => {
    requests++;
    throw new Error('Unexpected REST request');
  });
  try {
    for (let seq = 2; seq <= 101; seq++) {
      sync.receive(event(seq));
      sync.receive(event(seq));
    }
    await eventually(() => seqs(queryClient, options).length === 101);
    assert.equal(requests, 0);
    assert.equal(writes, 1);
    assert.ok(
      queryClient.getQueryData(options.queryKey).pages.every((page) => page.messages.length <= 50)
    );
  } finally {
    unsubscribe();
    sync.dispose();
    queryClient.clear();
  }
});

test('sequence gaps trigger targeted recovery, and unknown chats coalesce metadata lookup', async () => {
  const queryClient = client();
  const options = seedHistory(queryClient, [2, 1]);
  const sync = createChatSynchronizer(queryClient, () => true);
  let metadataCalls = 0;
  let historyCalls = 0;
  transport((config) => {
    if (config.url.endsWith('/messages')) {
      historyCalls++;
      return envelope(page([5, 4, 3, 2, 1]));
    }
    metadataCalls++;
    return envelope(chat(chatId, 5));
  });
  try {
    sync.receive(event(5));
    sync.receive(event(5));
    await eventually(() => seqs(queryClient, options).length === 5 && metadataCalls === 1);
    assert.equal(historyCalls, 1);
    assert.equal(queryClient.getQueryData(chatByIdQueryOptions(chatId).queryKey).id, chatId);
  } finally {
    sync.dispose();
    queryClient.clear();
  }
});

test('an initial HTTP snapshot arriving after a much newer event recovers the intervening gap', async () => {
  const queryClient = client();
  const options = chatMessagesInfiniteQueryOptions({ chatId });
  const sync = createChatSynchronizer(queryClient, () => true);
  let release;
  let requests = 0;
  transport(async (config) => {
    requests++;
    if (requests === 1)
      return new Promise((resolve) => {
        release = () => resolve(envelope(page([2, 1])));
      });
    const top = config.params.beforeSeq === undefined ? 250 : config.params.beforeSeq - 1;
    const bottom = Math.max(1, top - 99);
    return envelope(
      page(
        Array.from({ length: top - bottom + 1 }, (_, index) => top - index),
        bottom > 1
      )
    );
  });
  try {
    const initial = queryClient.fetchInfiniteQuery(options);
    await eventually(() => Boolean(release));
    applyMessageToCache(queryClient, chatId, message(250));
    release();
    await initial;
    await eventually(() => seqs(queryClient, options).length === 250);
    assert.equal(requests, 4);
  } finally {
    sync.dispose();
    queryClient.clear();
  }
});

test('recovery is concurrency-limited and disposal prevents late writes', async () => {
  const queryClient = client();
  const releases = [];
  for (let id = 0; id < 5; id++) seedHistory(queryClient, [1], 50, 'chat-' + id);
  const sync = createChatSynchronizer(queryClient, () => true);
  transport(() => new Promise((resolve) => releases.push(() => resolve(envelope(page([2, 1]))))));
  sync.reconcile();
  await eventually(() => releases.length === 3);
  sync.dispose();
  queryClient.clear();
  for (const release of releases) release();
  await delay(20);
  assert.equal(releases.length, 3);
  assert.equal(queryClient.getQueryCache().getAll().length, 0);
});

const fakeConnection = (overrides = {}) => {
  let config;
  let invalidations = 0;
  let connected = 0;
  const received = [];
  const subscriptions = [];
  let session = {
    accessToken: 'test-only',
    expiresAt: new Date(Date.now() + 60_000).toISOString()
  };
  const fake = {
    activate() {
      config.beforeConnect();
    },
    deactivate() {
      fake.deactivated = true;
      return Promise.resolve();
    },
    forceDisconnect() {
      fake.disconnected = true;
    },
    subscribe(destination, callback, headers) {
      subscriptions.push({ destination, callback, headers });
    }
  };
  const stop = startMessageConnection({
    getSession: () => session,
    webSocketFactory: () => {
      throw new Error('No actual sockets in tests');
    },
    createClient: (options) => {
      config = options;
      return fake;
    },
    onInvalidSession: () => invalidations++,
    onConnected: () => connected++,
    onMessage: (message) => received.push(message),
    checkAuthentication: async () => true,
    ...overrides
  });
  return {
    config,
    fake,
    stop,
    subscriptions,
    received,
    session,
    invalidate: () => {
      session = null;
    },
    counts: () => ({ invalidations, connected })
  };
};

test('CONNECT uses a bearer header; each reconnect subscribes once to the sole private destination', () => {
  const connection = fakeConnection();
  try {
    assert.deepEqual(connection.fake.connectHeaders, { Authorization: 'Bearer test-only' });
    assert.equal(connection.config.heartbeatIncoming, 10000);
    assert.equal(connection.config.heartbeatOutgoing, 10000);
    assert.equal(connection.config.maxReconnectDelay, 30000);
    connection.config.onConnect();
    connection.config.onConnect(); // Simulate a subsequent transport connection.
    assert.equal(connection.subscriptions.length, 2);
    for (const subscription of connection.subscriptions) {
      assert.equal(subscription.destination, '/user/queue/messages');
      assert.deepEqual(subscription.headers, { ack: 'auto' });
    }
    connection.subscriptions[1].callback({ body: JSON.stringify(event(1)) });
    connection.subscriptions[1].callback({ body: '{' });
    assert.equal(connection.received.length, 1);
    connection.stop();
    connection.subscriptions[1].callback({ body: JSON.stringify(event(2)) });
    assert.equal(connection.received.length, 1);
    assert.equal(connection.fake.deactivated, true);
  } finally {
    connection.stop();
  }
});

test('invalid/changed sessions stop reconnects; broker errors do not invalidate a valid login', async () => {
  const connection = fakeConnection();
  try {
    connection.config.onStompError({});
    await delay(0);
    assert.equal(connection.counts().invalidations, 0);
    connection.invalidate();
    connection.config.beforeConnect();
    assert.equal(connection.fake.deactivated, true);
    assert.equal(connection.counts().invalidations, 1);
  } finally {
    connection.stop();
  }
  const denied = fakeConnection({ checkAuthentication: async () => false });
  try {
    denied.config.onStompError({});
    await eventually(() => denied.fake.deactivated);
    assert.equal(denied.counts().invalidations, 1);
  } finally {
    denied.stop();
  }
});

test('bulk cache writes preserve stable ordering without manufacturing unread/presence fields', () => {
  const queryClient = client();
  try {
    const options = seedHistory(queryClient, [1]);
    applyMessagesToCache(queryClient, chatId, [message(3), message(2), message(3)]);
    assert.deepEqual(seqs(queryClient, options), [3, 2, 1]);
  } finally {
    queryClient.clear();
  }
});

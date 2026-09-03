import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

test('chat UI loads API data, keeps failed drafts, and displays only confirmed sends', async (t) => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
  });
  const keys = [
    'window',
    'localStorage',
    'document',
    'HTMLElement',
    'Element',
    'Node',
    'ShadowRoot',
    'HTMLInputElement',
    'HTMLTextAreaElement',
    'MutationObserver',
    'getComputedStyle',
    'requestAnimationFrame',
    'cancelAnimationFrame'
  ];
  const saved = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys)
    Object.defineProperty(globalThis, key, {
      value: dom.window[key],
      configurable: true,
      writable: true
    });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const ResizeObserverStub = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.ResizeObserver = ResizeObserverStub;
  dom.window.ResizeObserver = ResizeObserverStub;
  dom.window.HTMLElement.prototype.getAnimations = () => [];
  dom.window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {}
  });

  const server = await createServer({
    configFile: false,
    resolve: { alias: { '@': resolve('src') } },
    server: { middlewareMode: true, ws: false },
    appType: 'custom'
  });
  t.after(() => server.close());
  const { createElement, act } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
  const { apiClient } = await server.ssrLoadModule('/src/shared/api/client.ts');
  const { ChatLayout } = await server.ssrLoadModule('/src/features/chat/ui/ChatLayout.tsx');
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  });
  const root = createRoot(document.getElementById('root'));
  let failSend = true;
  const messages = [
    {
      id: 'm1',
      seq: 1,
      text: 'Actual API history',
      createdAt: '2026-09-03T09:00:00',
      senderId: 'peer',
      mine: false
    }
  ];
  const chat = {
    id: 'chat-id',
    type: 'DIRECT',
    peer: { id: 'peer', firstname: 'API', lastname: 'Peer', username: 'api-peer' },
    lastMessage: messages[0],
    createdAt: '2026-09-03T09:00:00',
    updatedAt: '2026-09-03T09:00:00'
  };
  apiClient.defaults.adapter = async (config) => {
    let data;
    if (config.url === '/chats')
      data = {
        success: true,
        results: [chat],
        page: 0,
        size: 20,
        total: 1,
        hasNext: false,
        hasPrev: false
      };
    else if (config.url === '/chats/chat-id') data = { success: true, data: chat };
    else if (config.url === '/chats/chat-id/messages' && config.method === 'get')
      data = {
        success: true,
        data: { messages: [...messages].reverse(), nextBeforeSeq: null, hasMore: false }
      };
    else if (config.url === '/chats/chat-id/messages' && config.method === 'post') {
      if (failSend) throw new Error('Test connection failure');
      const sent = {
        id: 'm2',
        seq: 2,
        senderId: 'me',
        mine: true,
        text: JSON.parse(config.data).text,
        createdAt: '2026-09-03T09:01:00'
      };
      messages.push(sent);
      chat.lastMessage = sent;
      data = { success: true, data: sent };
    } else throw new Error('Unexpected API call: ' + config.url);
    return { data, config, headers: {}, status: 200, statusText: 'OK' };
  };
  const waitFor = async (predicate) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (predicate()) return;
      await act(async () => {
        await new Promise((done) => setTimeout(done, 20));
      });
    }
    assert.fail('UI did not reach expected state: ' + document.body.textContent);
  };
  try {
    await act(async () =>
      root.render(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(ChatLayout, {
            currentUser: {
              id: 'me',
              firstname: 'Me',
              lastname: null,
              username: 'me',
              phoneNumber: '',
              roles: ['USER']
            },
            onLogout() {}
          })
        )
      )
    );
    await waitFor(() => document.body.textContent.includes('API Peer'));
    assert.equal(document.body.textContent.includes('Nigina'), false);
    const conversation = [...document.querySelectorAll('button')].find((button) =>
      button.textContent.includes('API Peer')
    );
    await act(async () => conversation.click());
    await waitFor(
      () => document.querySelector('textarea') && !document.querySelector('textarea').disabled
    );
    assert.ok(
      document
        .querySelector('[aria-label="Message history"]')
        .textContent.includes('Actual API history')
    );

    const textarea = document.querySelector('textarea');
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, 'value').set.call(
        textarea,
        'My real message'
      );
      textarea.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    await act(async () => document.querySelector('[aria-label="Send message"]').click());
    await waitFor(() => document.body.textContent.includes('Test connection failure'));
    assert.equal(textarea.value, 'My real message');
    assert.equal(messages.length, 1);
    failSend = false;
    await act(async () => document.querySelector('[aria-label="Send message"]').click());
    await waitFor(
      () =>
        textarea.value === '' &&
        document
          .querySelector('[aria-label="Message history"]')
          .textContent.includes('My real message')
    );
    assert.equal(messages.length, 2);
    assert.equal(
      document.querySelector('[aria-label="Message history"]').textContent.match(/My real message/g)
        .length,
      1
    );
  } finally {
    await act(async () => root.unmount());
    queryClient.clear();
    await server.close();
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    delete globalThis.ResizeObserver;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});

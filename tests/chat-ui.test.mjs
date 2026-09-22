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
    'cancelAnimationFrame',
    'Image'
  ];
  const saved = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys)
    Object.defineProperty(globalThis, key, {
      value: dom.window[key],
      configurable: true,
      writable: true
    });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const preloadedImages = [];
  globalThis.Image = class {
    decoding = 'auto';
    onerror = null;
    onload = null;

    constructor() {
      preloadedImages.push(this);
    }

    decode() {
      return Promise.resolve();
    }

    set src(value) {
      this.currentSrc = value;
    }
  };
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
  const { ChatPage } = await server.ssrLoadModule('/src/features/chat/ui/ChatPage.tsx');
  const { applyMessageToCache } = await server.ssrLoadModule(
    '/src/features/chat/model/chat-cache.ts'
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  });
  const root = createRoot(document.getElementById('root'));
  let failSend = true;
  let selectedChatId = null;
  const messages = [
    {
      id: 'm1',
      seq: 1,
      text: 'Actual API history',
      createdAt: '2026-09-03T09:00:00',
      senderId: 'peer',
      mine: false,
      attachments: [
        {
          sortOrder: 2,
          attachment: {
            name: 'brief.pdf',
            contentType: 'application/pdf',
            sizeBytes: 2048,
            publicURL: 'https://cdn.example.test/brief.pdf',
            thumbnailURL: null,
            type: 'PDF',
            preview: null
          }
        },
        {
          sortOrder: 0,
          attachment: {
            name: 'photo.jpg',
            contentType: 'image/jpeg',
            sizeBytes: 4096,
            publicURL: 'https://cdn.example.test/photo.jpg',
            thumbnailURL: null,
            type: 'IMAGE',
            preview: {
              status: 'READY',
              url: 'https://cdn.example.test/photo-preview.jpg',
              contentType: 'image/jpeg',
              sizeBytes: 512,
              width: 640,
              height: 427
            }
          }
        },
        {
          sortOrder: 1,
          attachment: {
            name: 'large-video.mp4',
            contentType: 'video/mp4',
            sizeBytes: 50_000_000,
            publicURL: 'https://cdn.example.test/large-video.mp4',
            thumbnailURL: null,
            type: 'VIDEO',
            preview: {
              status: 'PENDING',
              url: null,
              contentType: null,
              sizeBytes: null,
              width: null,
              height: null
            }
          }
        }
      ]
    }
  ];
  const chat = {
    id: 'chat-id',
    type: 'DIRECT',
    peer: { id: 'peer', firstname: 'API', lastname: 'Peer', username: 'api-peer' },
    peerPresence: {
      userId: 'peer',
      status: 'ONLINE',
      lastSeenAt: null,
      changedAt: '2026-09-18T10:16:00Z'
    },
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
      const payload = JSON.parse(config.data);
      assert.deepEqual(payload.attachments, []);
      const sent = {
        id: 'm2',
        seq: 2,
        senderId: 'me',
        mine: true,
        text: payload.text,
        createdAt: '2026-09-03T09:01:00',
        attachments: []
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
          createElement(ChatPage, {
            activeChatId: 'chat-id',
            currentUser: {
              id: 'me',
              firstname: 'Me',
              lastname: null,
              username: 'me',
              phoneNumber: '',
              roles: ['USER']
            },
            onBack() {},
            onLogout() {},
            onSelectChat(id) {
              selectedChatId = id;
            }
          })
        )
      )
    );
    await waitFor(() => document.body.textContent.includes('API Peer'));
    assert.ok(document.querySelector('[aria-label="Online"]'));
    assert.ok(document.body.textContent.includes('online'));
    assert.equal(document.body.textContent.includes('Nigina'), false);
    const conversation = [...document.querySelectorAll('button')].find((button) =>
      button.textContent.includes('API Peer')
    );
    await act(async () => conversation.click());
    assert.equal(selectedChatId, 'chat-id');
    await waitFor(
      () => document.querySelector('textarea') && !document.querySelector('textarea').disabled
    );
    assert.ok(
      document
        .querySelector('[aria-label="Message history"]')
        .textContent.includes('Actual API history')
    );
    const photo = document.querySelector('img[alt="photo.jpg"]');
    assert.equal(photo.getAttribute('src'), 'https://cdn.example.test/photo-preview.jpg');
    assert.ok(photo.classList.contains('object-cover'));
    assert.equal(photo.closest('figure').style.aspectRatio, '640 / 427');
    assert.equal(preloadedImages.length, 1);
    assert.equal(preloadedImages[0].currentSrc, 'https://cdn.example.test/photo.jpg');
    await act(async () => {
      preloadedImages[0].onload();
      await Promise.resolve();
    });
    await waitFor(
      () =>
        document.querySelector('img[alt="photo.jpg"]')?.getAttribute('src') ===
        'https://cdn.example.test/photo.jpg'
    );
    await act(async () => photo.dispatchEvent(new dom.window.Event('load')));
    assert.equal(
      document
        .querySelector('[aria-label="Message history"]')
        .textContent.includes('Image unavailable'),
      false
    );
    const pendingVideo = document.querySelector(
      '[aria-label="Play video large-video.mp4"] [data-slot="media-thumbnail"]'
    );
    assert.equal(pendingVideo.dataset.state, 'pending');
    assert.ok(pendingVideo.querySelector('.bg-black'));
    assert.equal(document.querySelector('img[alt="large-video.mp4"]'), null);

    const processedMessage = {
      ...messages[0],
      attachments: messages[0].attachments.map((item) =>
        item.attachment.type === 'VIDEO'
          ? {
              ...item,
              attachment: {
                ...item.attachment,
                preview: {
                  status: 'READY',
                  url: 'https://cdn.example.test/large-video-preview.jpg',
                  contentType: 'image/jpeg',
                  sizeBytes: 1024,
                  width: 640,
                  height: 360
                }
              }
            }
          : item
      )
    };
    await act(async () => applyMessageToCache(queryClient, 'chat-id', processedMessage));
    await waitFor(() => document.querySelector('img[alt="large-video.mp4"]'));
    assert.equal(
      document.querySelector('img[alt="large-video.mp4"]').getAttribute('src'),
      'https://cdn.example.test/large-video-preview.jpg'
    );
    await act(async () =>
      document.querySelector('img[alt="photo.jpg"]').dispatchEvent(new dom.window.Event('error'))
    );
    await waitFor(
      () =>
        document.querySelector('img[alt="photo.jpg"]')?.getAttribute('src') ===
        'https://cdn.example.test/photo-preview.jpg'
    );
    assert.equal(pendingVideo.dataset.state, 'available');
    await act(async () => applyMessageToCache(queryClient, 'chat-id', messages[0]));
    assert.equal(
      document.querySelector('img[alt="large-video.mp4"]').getAttribute('src'),
      'https://cdn.example.test/large-video-preview.jpg'
    );
    await act(async () =>
      document.querySelector('[aria-label="Play video large-video.mp4"]').click()
    );
    await waitFor(() => document.querySelector('video[aria-label="large-video.mp4"]'));
    const video = document.querySelector('video[aria-label="large-video.mp4"]');
    assert.equal(video.getAttribute('src'), 'https://cdn.example.test/large-video.mp4');
    assert.equal(video.getAttribute('poster'), 'https://cdn.example.test/large-video-preview.jpg');
    assert.equal(video.getAttribute('preload'), 'none');
    assert.ok(
      document.querySelector('[aria-label="Message history"]').textContent.includes('brief.pdf')
    );
    assert.ok(document.querySelector('input[aria-label="Choose attachments"][multiple]'));

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

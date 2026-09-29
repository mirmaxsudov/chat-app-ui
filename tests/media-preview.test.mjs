import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { after, it } from 'vitest';

const server = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  server: { middlewareMode: true, ws: false },
  appType: 'custom'
});

after(() => server.close());

it('original image queue deduplicates URLs, waits for decode, and limits concurrency', async () => {
  const originalImage = globalThis.Image;
  const instances = [];
  class ControlledImage {
    decoding = 'auto';
    onerror = null;
    onload = null;
    decodeResolve = null;

    constructor() {
      instances.push(this);
    }

    decode() {
      return new Promise((resolveDecode) => {
        this.decodeResolve = resolveDecode;
      });
    }

    set src(value) {
      this.currentSrc = value;
    }
  }
  globalThis.Image = ControlledImage;

  try {
    const { preloadOriginalImage } = await server.ssrLoadModule(
      '/src/features/message/media/image-load-queue.ts'
    );
    const first = preloadOriginalImage('https://cdn.example.test/1.jpg');
    const duplicate = preloadOriginalImage('https://cdn.example.test/1.jpg');
    const requests = [
      first,
      preloadOriginalImage('https://cdn.example.test/2.jpg'),
      preloadOriginalImage('https://cdn.example.test/3.jpg'),
      preloadOriginalImage('https://cdn.example.test/4.jpg'),
      preloadOriginalImage('https://cdn.example.test/5.jpg')
    ];

    assert.equal(first, duplicate);
    assert.equal(instances.length, 3);
    instances[0].onload();
    await Promise.resolve();
    assert.equal(instances.length, 3, 'the queue must wait for decode, not only load');
    instances[0].decodeResolve();
    await first;
    await Promise.resolve();
    assert.equal(instances.length, 4);

    for (let index = 1; index < instances.length; index++) {
      instances[index].onload();
      await Promise.resolve();
      instances[index].decodeResolve();
      await Promise.resolve();
    }
    await Promise.all(requests);
    assert.equal(instances.length, 5);
  } finally {
    globalThis.Image = originalImage;
  }
});

it('viewport observation pools elements by root margin and cleans up the shared observer', async () => {
  const originalObserver = globalThis.IntersectionObserver;
  const instances = [];
  class ObserverStub {
    observed = new Set();
    disconnected = false;

    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      instances.push(this);
    }

    observe(element) {
      this.observed.add(element);
    }

    unobserve(element) {
      this.observed.delete(element);
    }

    disconnect() {
      this.disconnected = true;
    }
  }
  globalThis.IntersectionObserver = ObserverStub;

  try {
    const { observeNearViewport } = await server.ssrLoadModule(
      '/src/features/message/media/viewport-observer.ts?t=observer-test'
    );
    const firstElement = {};
    const secondElement = {};
    const states = [];
    const stopFirst = observeNearViewport(firstElement, (near) => states.push(['first', near]));
    const stopSecond = observeNearViewport(secondElement, (near) => states.push(['second', near]));

    assert.equal(instances.length, 1);
    assert.equal(instances[0].options.rootMargin, '800px 0px');
    instances[0].callback([
      { target: firstElement, isIntersecting: true },
      { target: secondElement, isIntersecting: false }
    ]);
    assert.deepEqual(states, [
      ['first', true],
      ['second', false]
    ]);
    stopFirst();
    assert.equal(instances[0].disconnected, false);
    stopSecond();
    assert.equal(instances[0].disconnected, true);
  } finally {
    globalThis.IntersectionObserver = originalObserver;
  }
});

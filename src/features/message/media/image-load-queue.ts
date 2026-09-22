const MAX_CONCURRENT_LOADS = 3;

const cache = new Map<string, Promise<void>>();
const pending: Array<() => void> = [];
let activeLoads = 0;

const decodeImage = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (typeof image.decode !== 'function') {
        resolve();
        return;
      }
      image.decode().then(resolve, reject);
    };
    image.onerror = () => reject(new Error(`Could not load attachment image: ${url}`));
    image.src = url;
  });

const pumpQueue = () => {
  while (activeLoads < MAX_CONCURRENT_LOADS && pending.length > 0) {
    activeLoads += 1;
    pending.shift()?.();
  }
};

const enqueue = (url: string): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    pending.push(() => {
      decodeImage(url)
        .then(resolve, reject)
        .finally(() => {
          activeLoads -= 1;
          pumpQueue();
        });
    });
    pumpQueue();
  });

export const preloadOriginalImage = (url: string): Promise<void> => {
  const cached = cache.get(url);
  if (cached) return cached;

  const request = enqueue(url);
  cache.set(url, request);
  void request.catch(() => cache.delete(url));
  return request;
};

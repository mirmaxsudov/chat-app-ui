type NearViewportCallback = (isNearViewport: boolean) => void;

interface ObserverPool {
  callbacks: Map<Element, NearViewportCallback>;
  observer: IntersectionObserver;
}

const pools = new Map<string, ObserverPool>();

const createPool = (rootMargin: string): ObserverPool => {
  const callbacks = new Map<Element, NearViewportCallback>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
    },
    { root: null, rootMargin, threshold: 0.01 }
  );

  return { callbacks, observer };
};

export const observeNearViewport = (
  element: Element,
  callback: NearViewportCallback,
  rootMargin = '800px 0px'
): (() => void) => {
  if (typeof IntersectionObserver === 'undefined') {
    callback(true);
    return () => undefined;
  }

  const pool = pools.get(rootMargin) ?? createPool(rootMargin);
  pools.set(rootMargin, pool);
  pool.callbacks.set(element, callback);
  pool.observer.observe(element);

  return () => {
    pool.observer.unobserve(element);
    pool.callbacks.delete(element);
    if (pool.callbacks.size === 0) {
      pool.observer.disconnect();
      pools.delete(rootMargin);
    }
  };
};

/**
 * Simple API cache layer for fast performance.
 * Caches GET requests with TTL to reduce server load and improve UI speed.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtl = 30_000; // 30 seconds

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl ?? this.defaultTtl),
    });
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  invalidatePattern(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new ApiCache();

/**
 * Wrapped fetch with caching for GET requests.
 * Use cachedGet for read-heavy endpoints (items, units, vendors, stock, dashboard).
 */
export async function cachedGet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
  const cached = apiCache.get<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  apiCache.set(key, data, ttl);
  return data;
}

export function invalidateCache(prefix?: string): void {
  apiCache.invalidate(prefix);
}

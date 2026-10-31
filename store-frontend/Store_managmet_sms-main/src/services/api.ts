import HttpNetworkService from "./network";
import SharedPreferencesService from "./storage";
import { cachedGet, invalidateCache } from "./cache";

/**
 * Single shared HTTP client.
 *
 * `network.tsx` already injects the JWT and normalises Axios errors, so pages
 * should use this wrapper instead of constructing their own clients.
 */
const http = new HttpNetworkService(SharedPreferencesService.getInstance());

const stripSlashes = (path: string) => path.replace(/^\/+/, "");

/**
 * Cached GET — for read-heavy endpoints (items, units, vendors, stock, dashboard).
 * Results are cached for 30 seconds by default to reduce server load and
 * make the UI feel instant on repeat visits.
 */
export const cachedApi = {
  get: <T>(path: string, ttl?: string | number) =>
    cachedGet<T>(
      stripSlashes(path),
      () => http.get<T>(stripSlashes(path)),
      typeof ttl === "number" ? ttl : 30_000
    ),
};

/**
 * Uncached methods — for writes (POST/PUT/PATCH/DELETE) and when you need
 * fresh data.
 */
export const api = {
  get: <T>(path: string) => http.get<T>(stripSlashes(path)),
  post: <T>(path: string, body?: unknown) => http.post<T>(stripSlashes(path), body ?? {}),
  patch: <T>(path: string, body?: unknown) => http.patch<T>(stripSlashes(path), body ?? {}),
  put: <T>(path: string, body?: unknown) => http.put<T>(stripSlashes(path), body ?? {}),
  delete: <T>(path: string) => http.delete<T>(stripSlashes(path)),
};

/**
 * Invalidate cached data after a write operation so the next read is fresh.
 */
export const apiInvalidate = (prefix?: string) => {
  invalidateCache(prefix);
};

/** Build a query string, skipping empty values. */
export const query = (params: Record<string, string | number | undefined | null>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const result = search.toString();
  return result ? `?${result}` : "";
};

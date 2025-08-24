import { useState, useEffect, useRef } from 'react';

interface UseSilentDataOptions<T> {
  cacheKey: string;
  fetcher: () => Promise<T>;
  parse?: (raw: unknown) => T | null;
  serialize?: (data: T) => string;
  revalidateIntervalMs?: number; // optional periodic revalidation
  compare?: (a: T, b: T) => boolean; // return true if equal (skip update)
}

interface UseSilentDataResult<T> {
  data: T | null;
  refresh: () => void; // manual trigger
  stale: boolean; // true while background updating
  lastUpdated: number | null;
}

export function useSilentData<T>(options: UseSilentDataOptions<T>): UseSilentDataResult<T> {
  const { cacheKey, fetcher, parse, serialize, revalidateIntervalMs, compare } = options;
  const [data, setData] = useState<T | null>(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      if (parse) return parse(JSON.parse(raw));
      return JSON.parse(raw) as T;
    } catch { return null; }
  });
  const [stale, setStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const fetchingRef = useRef(false);

  const saveCache = (value: T) => {
    try {
      const payload = serialize ? serialize(value) : JSON.stringify(value);
      localStorage.setItem(cacheKey, payload);
    } catch { /* ignore */ }
  };

  const runFetch = async () => {
    if (fetchingRef.current) return; // avoid parallel
    fetchingRef.current = true;
    setStale(true);
    try {
      const fresh = await fetcher();
      if (fresh != null) {
        const equal = data != null && compare ? compare(data, fresh) : false;
        if (!equal) {
          setData(fresh);
          saveCache(fresh);
          setLastUpdated(Date.now());
        }
      }
    } catch { /* silent */ }
    finally {
      fetchingRef.current = false;
      setStale(false);
    }
  };

  useEffect(() => { runFetch(); // initial
    if (revalidateIntervalMs) {
      const id = setInterval(runFetch, revalidateIntervalMs);
      return () => clearInterval(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { data, refresh: runFetch, stale, lastUpdated };
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function get<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() - entry.timestamp >= entry.ttl) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

export function set<T>(key: string, data: T, ttl: number = 60 * 60 * 1000): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
    });
}

export function cleanup(): void {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp >= entry.ttl) {
            cache.delete(key);
            count++;
        }
    }

    if (count > 0) {
        ak.Logger.debug(`Cache cleanup: removed ${count} expired entries`);
    }
}

export function clear(): void {
    cache.clear();
}

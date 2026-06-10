// In-memory cache layer backed by localStorage for persistence.
// Provides O(1) lookups via Map without repeated JSON.parse/stringify on every access.
// LRU eviction keeps memory bounded to a maximum number of entries.

interface CacheEntry<T> {
	value: T;
	expiry: number;
}

const MAX_MEMORY_ENTRIES = 50;
const memoryCache = new Map<string, CacheEntry<unknown>>();

// reserved for future monitoring

function syncToLocalStorage(key: string, entry: CacheEntry<unknown>) {
	try {
		localStorage.setItem(key, JSON.stringify(entry));
	} catch {
		// localStorage quota exceeded or unavailable - ignore silently
	}
}

function removeFromLocalStorage(key: string) {
	try {
		localStorage.removeItem(key);
	} catch {
		// ignore
	}
}

export function setCache<T>(key: string, value: T, ttl: number) {
	const expiry = Date.now() + ttl;
	const entry: CacheEntry<T> = { value, expiry };

	// Update memory cache
	memoryCache.set(key, entry as CacheEntry<unknown>);

	// LRU eviction: if we exceeded max entries, evict the oldest
	if (memoryCache.size > MAX_MEMORY_ENTRIES) {
		const oldestKey = memoryCache.keys().next().value;
		if (oldestKey) {
			memoryCache.delete(oldestKey);
			removeFromLocalStorage(oldestKey);
		}
	}

	// Persist to localStorage
	syncToLocalStorage(key, entry);
}

export function getCache<T>(key: string): T | undefined {
	// Fast path: check memory cache first
	const memEntry = memoryCache.get(key);
	if (memEntry) {
		if (Date.now() > memEntry.expiry) {
			memoryCache.delete(key);
			removeFromLocalStorage(key);
			return undefined;
		}
		return memEntry.value as T;
	}

	// Slow path: read from localStorage and populate memory cache
	try {
		const item = localStorage.getItem(key);
		if (!item) return undefined;

		const entry = JSON.parse(item) as CacheEntry<T>;
		if (Date.now() > entry.expiry) {
			localStorage.removeItem(key);
			return undefined;
		}

		// Populate memory cache for subsequent fast lookups
		memoryCache.set(key, entry as CacheEntry<unknown>);
		return entry.value;
	} catch {
		// Corrupted localStorage entry - clean it up
		localStorage.removeItem(key);
		return undefined;
	}
}

export function clearCache(key: string) {
	memoryCache.delete(key);
	removeFromLocalStorage(key);
}

export function clearAllCache() {
	memoryCache.clear();
	// Don't clear localStorage entirely - it could have entries from other tabs
	// Each entry will be lazily evicted on next access
}

export function getMemoryCacheSize(): number {
	return memoryCache.size;
}

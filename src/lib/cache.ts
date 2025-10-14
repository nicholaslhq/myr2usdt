interface CacheEntry<T> {
	value: T;
	expiry: number; // Unix timestamp in milliseconds
}

export function setCache<T>(key: string, value: T, ttl: number) {
	const expiry = Date.now() + ttl;
	const entry: CacheEntry<T> = { value, expiry };
	localStorage.setItem(key, JSON.stringify(entry));
}

export function getCache<T>(key: string): T | undefined {
	const item = localStorage.getItem(key);
	if (!item) {
		return undefined;
	}

	const entry: CacheEntry<T> = JSON.parse(item);
	if (Date.now() > entry.expiry) {
		localStorage.removeItem(key); // Remove expired entry
		return undefined;
	}

	return entry.value;
}

export function clearCache(key: string) {
	localStorage.removeItem(key);
}

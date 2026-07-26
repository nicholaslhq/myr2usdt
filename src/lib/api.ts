import { LunoApiResponse } from "@/app/api/luno/[pair]/route";
import { BinanceApiResponse } from "@/app/api/binance/[symbol]/route";
import { HuobiApiResponse } from "@/app/api/huobi/[symbol]/route";
import { HataApiResponse } from "@/app/api/hata/[pair]/route";
import { CoinGeckoApiResponse } from "@/app/api/coingecko/usdtmyr/route";
import { CoinbaseApiResponse } from "@/app/api/coinbase/usdtmyr/route";
import { BnmExchangeRate } from "@/app/api/bnm/usdmyr/route";
import { getCache, setCache } from "@/lib/cache";

const COINGECKO_CACHE_KEY = "coingecko-usdtmyr-price";
const COINBASE_CACHE_KEY = "coinbase-usdtmyr-price";
const BNM_CACHE_KEY = "bnm-usdmyr-price";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch deduplication: track in-flight requests to prevent duplicate fetches
const inFlightFetches = new Map<string, Promise<unknown>>();
const MAX_IN_FLIGHT_ENTRIES = 200;

// Retry configuration with exponential backoff
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

// Default fetch timeout
const FETCH_TIMEOUT_MS = 15_000;

function evictInFlightIfNeeded() {
	if (inFlightFetches.size > MAX_IN_FLIGHT_ENTRIES) {
		const oldestKey = inFlightFetches.keys().next().value;
		if (oldestKey) {
			inFlightFetches.delete(oldestKey);
		}
	}
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
	let lastError: unknown;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			return fn();
		} catch (err) {
			lastError = err;
			if (attempt < MAX_RETRIES) {
				const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}
	throw lastError;
}

interface FetchExternalOptions extends RequestInit {
	timeoutMs?: number;
}

export async function fetchExternal<T>(
	url: string,
	options: FetchExternalOptions = {},
): Promise<T> {
	const {
		timeoutMs = FETCH_TIMEOUT_MS,
		...fetchOptions
	} = options;

	async function attemptFetch(): Promise<T> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url, {
				...fetchOptions,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(
					`Server-side fetch failed: ${response.statusText} (${response.status})`,
				);
			}

			return (await response.json()) as T;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	return withRetry(attemptFetch);
}

/**
 * Fetch with multiple fallback URLs. Tries each URL in sequence until one succeeds.
 */
export async function fetchExternalWithFallback<T>(
	baseUrl: string,
	path: string,
	fallbackUrls: string[],
	errorPrefix: string,
	options: RequestInit = {},
): Promise<T> {
	const allUrls = [baseUrl, ...fallbackUrls];
	let lastError: unknown;

	for (const url of allUrls) {
		try {
			return await fetchExternal<T>(`${url}${path}`, {
				...options,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					Accept: "application/json",
					...options.headers,
				},
			});
		} catch (err) {
			lastError = err;
			console.warn(`[${errorPrefix}] Failed: ${url}`, err);
		}
	}

	throw new Error(
		`${errorPrefix}: All endpoints failed (${allUrls.join(", ")}). Last error: ${
			lastError instanceof Error ? lastError.message : "Unknown error"
		}`,
	);
}

function cachedFetch<T>(
	url: string,
	cacheKey: string | null,
	ttl: number,
	options?: RequestInit,
): Promise<T> {
	// Check cache first
	if (cacheKey) {
		const cached = getCache<T>(cacheKey);
		if (cached !== undefined) {
			return Promise.resolve(cached);
		}
	}

	// Deduplication: if a fetch for this URL is already in flight, reuse it
	const existing = inFlightFetches.get(url);
	if (existing) {
		return existing as Promise<T>;
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	const fetchPromise = (async () => {
		try {
			const result = await withRetry(async () => {
				const response = await fetch(url, {
					...options,
					signal: controller.signal,
				});
				if (!response.ok) {
					throw new Error(
						`Server-side fetch failed: ${response.statusText} (${response.status})`,
					);
				}
				return (await response.json()) as T;
			});

			// Store in cache
			if (cacheKey) {
				setCache(cacheKey, result, ttl);
			}
			return result;
		} finally {
			clearTimeout(timeoutId);
			inFlightFetches.delete(url);
		}
	})();

	inFlightFetches.set(url, fetchPromise);
	evictInFlightIfNeeded();
	return fetchPromise;
}

export interface MarketDetail {
	timestamp: number;
	price: number;
	bid: number;
	ask: number;
	volume: number;
}

export interface ExchangeRateDetails {
	rate: number;
	source: {
		platform: string;
		price: number;
		timestamp: number;
		bid?: number;
		ask?: number;
		volume?: number;
	};
	target: {
		platform: string;
		price: number;
		timestamp: number;
		bid?: number;
		ask?: number;
		volume?: number;
	};
}

export interface HistoricalRate {
	rate: number;
	timestamp: number;
	sourcePlatform?: string;
	targetPlatform?: string;
	cryptoAsset?: string;
}

/**
 * Standardized external API fetch with retry, timeout, and consistent error messages.
 * Replaces the legacy `fetcher` function used across all route handlers.
 */
export async function fetchExternalWithPrefix<T>(
	url: string,
	errorPrefix: string,
	options: RequestInit = {},
): Promise<T> {
	try {
		const data = await fetchExternal<T>(url, {
			...options,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Accept: "application/json",
				...options.headers,
			},
		});
		return data;
	} catch (error: unknown) {
		throw new Error(
			`${errorPrefix}: Failed to fetch data from server: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		);
	}
}

/**
 * Optimized fetch with deduplication, caching, and timeout.
 * Replaces the pattern of manual cache checks + fetcher calls.
 */
async function fetchWithCache<T>(
	url: string,
	cacheKey: string | null,
	ttl: number,
	options?: RequestInit,
): Promise<T> {
	return cachedFetch<T>(url, cacheKey, ttl, options);
}

export async function fetchLunoPrice(pair: string): Promise<MarketDetail> {
	const data = await fetchWithCache<LunoApiResponse>(
		`/api/luno/${pair}`,
		null, // Luno prices are not cached (they're already fetched server-side)
		0,
	);
	return {
		price: parseFloat(data.last_trade),
		timestamp: data.timestamp,
		bid: parseFloat(data.bid),
		ask: parseFloat(data.ask),
		volume: parseFloat(data.rolling_24_hour_volume),
	};
}

export async function fetchBinancePrice(symbol: string): Promise<MarketDetail> {
	const data = await fetchWithCache<BinanceApiResponse>(
		`/api/binance/${symbol}`,
		null,
		0,
	);
	return {
		price: parseFloat(data.lastPrice),
		timestamp: data.openTime,
		bid: parseFloat(data.bidPrice),
		ask: parseFloat(data.askPrice),
		volume: parseFloat(data.volume),
	};
}

export async function fetchHuobiPrice(symbol: string): Promise<MarketDetail> {
	const data = await fetchWithCache<HuobiApiResponse>(
		`/api/huobi/${symbol}`,
		null,
		0,
	);
	return {
		price: data.tick.close,
		timestamp: data.ts,
		bid: data.tick.bid?.[0] || 0,
		ask: data.tick.ask?.[0] || 0,
		volume: data.tick.vol,
	};
}

export async function fetchCoinGeckoPrice(): Promise<number> {
	const data = await fetchWithCache<CoinGeckoApiResponse>(
		"https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=myr",
		COINGECKO_CACHE_KEY,
		CACHE_TTL,
	);

	if (data?.tether?.myr !== undefined) {
		return data.tether.myr;
	}
	throw new Error(
		"CoinGecko API returned unexpected data structure for USDT/MYR.",
	);
}

export async function fetchCoinbasePrice(): Promise<number> {
	const data = await fetchWithCache<CoinbaseApiResponse>(
		"https://api.coinbase.com/v2/exchange-rates?currency=USDT",
		COINBASE_CACHE_KEY,
		CACHE_TTL,
	);

	if (data?.data?.amount !== undefined) {
		const price = parseFloat(data.data.amount);
		return price;
	}

	if (data?.data?.rates?.MYR !== undefined) {
		const price = parseFloat(data.data.rates.MYR);
		return price;
	}

	throw new Error(
		"Coinbase API returned unexpected data structure for USDT/MYR.",
	);
}

export async function fetchHataPrice(pair: string): Promise<MarketDetail> {
	const data = await fetchWithCache<HataApiResponse>(
		`/api/hata/${pair}`,
		null,
		0,
	);

	const bid = parseFloat(data.orderBook?.bids?.[0]?.price || "0");
	const ask = parseFloat(data.orderBook?.asks?.[0]?.price || "0");
	const price = parseFloat(data.exchangeInfo?.price || "0");
	const volume = parseFloat(data.exchangeInfo?.quote_volume || "0");

	return {
		price,
		timestamp: Date.now(),
		bid,
		ask,
		volume,
	};
}

export async function fetchBnmPrice(): Promise<BnmExchangeRate> {
	const data = await fetchWithCache<BnmExchangeRate>(
		"/api/bnm/usdmyr",
		BNM_CACHE_KEY,
		CACHE_TTL,
	);

	return data;
}

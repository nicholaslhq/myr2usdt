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
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

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

export async function fetcher<T>(
	url: string,
	errorMessage: string,
	options?: RequestInit,
	clientFallbackUrl?: string,
	clientFallbackOptions?: RequestInit
): Promise<T> {
	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(
				`${errorMessage}: Server-side fetch failed: ${response.statusText}`
			);
		}
		const result = await response.json();
		return result;
	} catch (serverError: unknown) {
		if (clientFallbackUrl) {
			try {
				const clientResponse = await fetch(
					clientFallbackUrl,
					clientFallbackOptions
				);
				if (!clientResponse.ok) {
					throw new Error(
						`${errorMessage}: Client-side fetch failed: ${clientResponse.statusText}`
					);
				}
				const clientResult = await clientResponse.json();
				return clientResult;
			} catch (clientError: unknown) {
				throw new Error(
					`${errorMessage}: Failed to fetch data from both server and client: ${
						clientError instanceof Error
							? clientError.message
							: "Unknown error"
					}`
				);
			}
		}
		throw new Error(
			`${errorMessage}: Failed to fetch data from server: ${
				serverError instanceof Error
					? serverError.message
					: "Unknown error"
			}`
		);
	}
}

export async function fetchLunoPrice(pair: string): Promise<MarketDetail> {
	try {
		const upperCasePair = pair.toUpperCase();
		const data = await fetcher<LunoApiResponse>(
			`/api/luno/${pair}`,
			"Luno API error",
			undefined,
			`https://api.luno.com/api/1/ticker?pair=${upperCasePair}`,
			undefined
		);
		if (data) {
			return {
				price: parseFloat(data.last_trade),
				timestamp: data.timestamp,
				bid: parseFloat(data.bid),
				ask: parseFloat(data.ask),
				volume: parseFloat(data.rolling_24_hour_volume),
			};
		} else {
			throw new Error("Luno API returned unexpected data structure.");
		}
	} catch (error) {
		throw error;
	}
}

export async function fetchBinancePrice(symbol: string): Promise<MarketDetail> {
	try {
		const upperCaseSymbol = symbol.toUpperCase();
		const data = await fetcher<BinanceApiResponse>(
			`/api/binance/${symbol}`,
			"Binance API error",
			undefined,
			`https://api.binance.com/api/v3/ticker/24hr?symbol=${upperCaseSymbol}`,
			undefined
		);
		if (data) {
			return {
				price: parseFloat(data.lastPrice),
				timestamp: data.openTime,
				bid: parseFloat(data.bidPrice),
				ask: parseFloat(data.askPrice),
				volume: parseFloat(data.volume),
			};
		} else {
			throw new Error("Binance API returned unexpected data structure.");
		}
	} catch (error) {
		throw error;
	}
}

export async function fetchHuobiPrice(symbol: string): Promise<MarketDetail> {
	try {
		const lowerCaseSymbol = symbol.toLowerCase();
		const data = await fetcher<HuobiApiResponse>(
			`/api/huobi/${symbol}`,
			"Huobi API error",
			undefined,
			`https://api.huobi.pro/market/detail/merged?symbol=${lowerCaseSymbol}`,
			undefined
		);
		if (data) {
			return {
				price: data.tick.close,
				timestamp: data.ts,
				bid: data.tick.bid?.[0] || 0,
				ask: data.tick.ask?.[0] || 0,
				volume: data.tick.vol,
			};
		} else {
			throw new Error("Huobi API returned unexpected data structure.");
		}
	} catch (error) {
		throw error;
	}
}

export async function fetchCoinGeckoPrice(): Promise<number> {
	const cachedRate = getCache<number>(COINGECKO_CACHE_KEY);
	if (cachedRate) {
		return cachedRate;
	}

	try {
		const data = await fetcher<CoinGeckoApiResponse>(
			"/api/coingecko/usdtmyr",
			"CoinGecko API error",
			undefined,
			"https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=myr",
			undefined
		);
		if (data && data.tether && data.tether.myr) {
			setCache(COINGECKO_CACHE_KEY, data.tether.myr, CACHE_TTL);
			return data.tether.myr;
		} else {
			throw new Error(
				"CoinGecko API returned unexpected data structure for USDT/MYR."
			);
		}
	} catch (error: unknown) {
		if (
			error instanceof Error &&
			error.message.includes("Too Many Requests") &&
			cachedRate
		) {
			return cachedRate;
		}
		throw error;
	}
}

export async function fetchCoinbasePrice(): Promise<number> {
	const cachedRate = getCache<number>(COINBASE_CACHE_KEY);
	if (cachedRate) {
		return cachedRate;
	}

	try {
		const data = await fetcher<CoinbaseApiResponse>(
			"/api/coinbase/usdtmyr",
			"Coinbase API error",
			undefined,
			"https://api.coinbase.com/v2/exchange-rates?currency=USDT",
			undefined
		);
		if (data && data.data && data.data.amount) {
			const price = parseFloat(data.data.amount);
			setCache(COINBASE_CACHE_KEY, price, CACHE_TTL);
			return price;
		} else if (
			data &&
			data.data &&
			data.data.rates &&
			data.data.rates.MYR
		) {
			// Fallback to rates object if amount is not present
			const price = parseFloat(data.data.rates.MYR);
			setCache(COINBASE_CACHE_KEY, price, CACHE_TTL);
			return price;
		} else {
			throw new Error(
				"Coinbase API returned unexpected data structure for USDT/MYR."
			);
		}
	} catch (error: unknown) {
		if (
			error instanceof Error &&
			error.message.includes("Too Many Requests") &&
			cachedRate
		) {
			return cachedRate;
		}
		throw error;
	}
}

export async function fetchHataPrice(pair: string): Promise<MarketDetail> {
	try {
		const upperCasePair = pair.toUpperCase();
		const data = await fetcher<HataApiResponse>(
			`/api/hata/${pair}`,
			"Hata API error",
			undefined,
			`https://api.hata.io/api/v1/public/exchangeInfo?pair=${upperCasePair}`,
			undefined
		);
		if (data && data.exchangeInfo && data.orderBook) {
			const bid = parseFloat(data.orderBook.bids[0]?.price || "0");
			const ask = parseFloat(data.orderBook.asks[0]?.price || "0");
			const price = parseFloat(data.exchangeInfo.price);
			const volume = parseFloat(data.exchangeInfo.quote_volume);

			return {
				price: price,
				timestamp: Date.now(), // Hata API does not provide timestamp, use current time
				bid: bid,
				ask: ask,
				volume: volume,
			};
		} else {
			throw new Error("Hata API returned unexpected data structure.");
		}
	} catch (error) {
		throw error;
	}
}

export async function fetchBnmPrice(): Promise<BnmExchangeRate> {
	const cachedRate = getCache<BnmExchangeRate>(BNM_CACHE_KEY);
	if (cachedRate) {
		return cachedRate;
	}

	try {
		const data = await fetcher<BnmExchangeRate>(
			"/api/bnm/usdmyr",
			"BNM API error",
			{
				headers: {
					Accept: "application/vnd.BNM.API.v1+json",
				},
			},
			"https://api.bnm.gov.my/public/exchange-rate",
			{
				headers: {
					Accept: "application/vnd.BNM.API.v1+json",
				},
			}
		);

		if (data) {
			setCache(BNM_CACHE_KEY, data, CACHE_TTL);
			return data;
		} else {
			throw new Error("BNM API returned unexpected data structure.");
		}
	} catch (error: unknown) {
		if (
			error instanceof Error &&
			error.message.includes("Too Many Requests") &&
			cachedRate
		) {
			return cachedRate;
		}
		throw error;
	}
}

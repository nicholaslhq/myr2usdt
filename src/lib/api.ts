import { LunoApiResponse } from "@/app/api/luno/[pair]/route";
import { BinanceApiResponse } from "@/app/api/binance/[symbol]/route";
import { HuobiApiResponse } from "@/app/api/huobi/[symbol]/route";

export interface MarketDetail {
	timestamp: number;
	price: number;
	bid: number;
	ask: number;
	volume: number;
}

export async function fetcher<T>(
	url: string,
	errorMessage: string
): Promise<T> {
	const response = await fetch(url);
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.error || `${errorMessage}: ${response.statusText}`
		);
	}
	const result = await response.json();
	return result;
}

export async function fetchLunoPrice(pair: string): Promise<MarketDetail> {
	try {
		const data = await fetcher<LunoApiResponse>(
			`/api/luno/${pair}`,
			"Luno API error"
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
		console.error(`Error fetching Luno price for ${pair}:`, error);
		throw error;
	}
}

export async function fetchBinancePrice(symbol: string): Promise<MarketDetail> {
	try {
		const data = await fetcher<BinanceApiResponse>(
			`/api/binance/${symbol}`,
			"Binance API error"
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
		console.error(`Error fetching Binance price for ${symbol}:`, error);
		throw error;
	}
}

export async function fetchHuobiPrice(symbol: string): Promise<MarketDetail> {
	try {
		const data = await fetcher<HuobiApiResponse>(
			`/api/huobi/${symbol}`,
			"Huobi API error"
		);
		if (data && data.tick) {
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
		console.error(`Error fetching Huobi price for ${symbol}:`, error);
		throw error;
	}
}

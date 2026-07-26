import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface BinanceApiResponse {
	symbol: string;
	priceChange: string;
	priceChangePercent: string;
	weightedAvgPrice: string;
	prevClosePrice: string;
	lastPrice: string;
	lastQty: string;
	bidPrice: string;
	bidQty: string;
	askPrice: string;
	askQty: string;
	openPrice: string;
	highPrice: string;
	lowPrice: string;
	volume: string;
	quoteVolume: string;
	openTime: number;
	closeTime: number;
	firstId: number;
	lastId: number;
	count: number;
}

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ symbol: string }> }
) {
	const { symbol } = await params;
	const upperCaseSymbol = symbol.toUpperCase();
	try {
		const data = await fetcher<BinanceApiResponse>(
			`https://api.binance.com/api/v3/ticker/24hr?symbol=${upperCaseSymbol}`,
			"Binance API error",
			{
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					Accept: "application/json",
				},
			}
		);

		if (data && data.symbol) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{ error: "Binance API returned unexpected or empty data." },
				{ status: 502 }
			);
		}
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: `Failed to fetch Binance price: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

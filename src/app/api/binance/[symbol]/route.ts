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

export async function GET(
	request: Request,
	{ params }: { params: { symbol: string } }
) {
	const { symbol } = await params;
	const upperCaseSymbol = symbol.toUpperCase();
	try {
		const data = await fetcher<BinanceApiResponse>(
			`https://api.binance.com/api/v3/ticker/24hr?symbol=${upperCaseSymbol}`,
			"Binance API error"
		);

		if (data) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{ error: "Binance API returned unexpected data structure." },
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		console.error(
			`Error fetching Binance price for ${upperCaseSymbol}:`,
			error
		);
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

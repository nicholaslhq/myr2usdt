import { NextResponse } from "next/server";
import { fetchExternalWithFallback } from "@/lib/api";

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

const BINANCE_FALLBACK_URLS = [
	"https://api1.binance.com",
	"https://api2.binance.com",
	"https://api3.binance.com",
	"https://api4.binance.com",
	"https://api-gcp.binance.com",
	"https://api.binance.us",
	"https://testnet.binance.vision",
	"https://data-api.binance.vision",
];

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ symbol: string }> },
) {
	const { symbol } = await params;
	const upperCaseSymbol = symbol.toUpperCase();
	const path = `/api/v3/ticker/24hr?symbol=${upperCaseSymbol}`;

	try {
		const data = await fetchExternalWithFallback<BinanceApiResponse>(
			"https://api.binance.com",
			path,
			BINANCE_FALLBACK_URLS,
			"Binance API error",
		);

		if (data && data.symbol) {
			return NextResponse.json(data);
		}

		return NextResponse.json(
			{ error: "Binance API returned unexpected or empty data." },
			{ status: 502 },
		);
	} catch (error: unknown) {
		console.error(
			`[Binance API] Error fetching ${upperCaseSymbol}:`,
			error,
		);
		return NextResponse.json(
			{
				error: `Failed to fetch Binance price: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 },
		);
	}
}

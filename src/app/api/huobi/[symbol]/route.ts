import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface HuobiApiResponse {
	ch: string;
	status: string;
	ts: number;
	tick: {
		id: number;
		version: number;
		open: number;
		close: number;
		low: number;
		high: number;
		amount: number;
		vol: number;
		count: number;
		bid: [number, number];
		ask: [number, number];
	};
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ symbol: string }> }
) {
	const { symbol } = await params;
	try {
		const lowerCaseSymbol = symbol.toLowerCase();
		const data = await fetcher<HuobiApiResponse>(
			`https://api.huobi.pro/market/detail/merged?symbol=${lowerCaseSymbol}`,
			"Huobi API error"
		);

		if (data) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{ error: "Huobi API returned unexpected data structure." },
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		console.error(`Error fetching Huobi price for ${symbol}:`, error);
		return NextResponse.json(
			{
				error: `Failed to fetch Huobi price: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

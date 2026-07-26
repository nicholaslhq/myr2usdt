import { NextResponse } from "next/server";
import { fetchExternalWithPrefix } from "@/lib/api";

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

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ symbol: string }> }
) {
	const { symbol } = await params;
	try {
		const lowerCaseSymbol = symbol.toLowerCase();
		const data = await fetchExternalWithPrefix<HuobiApiResponse>(
			`https://api.huobi.pro/market/detail/merged?symbol=${lowerCaseSymbol}`,
			"Huobi API error",
		);

		if (data && data.tick) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{ error: "Huobi API returned unexpected or empty data." },
				{ status: 502 }
			);
		}
	} catch (error: unknown) {
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

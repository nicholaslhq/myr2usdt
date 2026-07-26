import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface CoinbaseApiResponse {
	data: {
		amount?: string;
		base?: string;
		currency: string;
		rates?: {
			[key: string]: string;
		};
	};
}

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = await fetcher<CoinbaseApiResponse>(
			"https://api.coinbase.com/v2/prices/USDT-MYR/spot",
			"Coinbase API error",
			{
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					Accept: "application/json",
				},
			}
		);

		if (data && data.data) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{
					error: "Coinbase API returned unexpected or empty data for USDT/MYR.",
				},
				{ status: 502 }
			);
		}
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: `Failed to fetch Coinbase USDT/MYR price: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface CoinGeckoApiResponse {
	tether: {
		myr: number;
	};
}

export async function GET() {
	try {
		const data = await fetcher<CoinGeckoApiResponse>(
			"https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=myr",
			"CoinGecko API error"
		);

		if (data) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{
					error: "CoinGecko API returned unexpected data structure for USDT/MYR.",
				},
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: `Failed to fetch CoinGecko USDT/MYR price: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

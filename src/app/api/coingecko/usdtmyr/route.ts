import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface CoinGeckoApiResponse {
	tether: {
		myr: number;
	};
}

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = await fetcher<CoinGeckoApiResponse>(
			"https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=myr",
			"CoinGecko API error",
			{
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					Accept: "application/json",
				},
			}
		);

		if (data && data.tether?.myr !== undefined) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{
					error: "CoinGecko API returned unexpected or empty data for USDT/MYR.",
				},
				{ status: 502 }
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

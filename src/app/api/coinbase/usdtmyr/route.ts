import { NextResponse } from "next/server";
import { fetchExternalWithPrefix } from "@/lib/api";

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
		const data = await fetchExternalWithPrefix<CoinbaseApiResponse>(
			"https://api.coinbase.com/v2/prices/USDT-MYR/spot",
			"Coinbase API error",
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

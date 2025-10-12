import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface LunoApiResponse {
	pair: string;
	timestamp: number;
	bid: string;
	ask: string;
	last_trade: string;
	rolling_24_hour_volume: string;
	status: string;
}

export async function GET(
	request: Request,
	{ params }: { params: { pair: string } }
) {
	const { pair } = await params;
	const upperCasePair = pair.toUpperCase();
	try {
		const data = await fetcher<LunoApiResponse>(
			`https://api.luno.com/api/1/ticker?pair=${upperCasePair}`,
			"Luno API error"
		);

		if (data) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{ error: "Luno API returned unexpected data structure." },
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		console.error(`Error fetching Luno price for ${upperCasePair}:`, error);
		return NextResponse.json(
			{
				error: `Failed to fetch Luno price: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";
import { fetchExternalWithPrefix } from "@/lib/api";

export interface LunoApiResponse {
	pair: string;
	timestamp: number;
	bid: string;
	ask: string;
	last_trade: string;
	rolling_24_hour_volume: string;
	status: string;
}

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ pair: string }> }
) {
	const { pair } = await params;
	const upperCasePair = pair.toUpperCase();
	try {
		const data = await fetchExternalWithPrefix<LunoApiResponse>(
			`https://api.luno.com/api/1/ticker?pair=${upperCasePair}`,
			"Luno API error",
		);

		if (data && data.pair) {
			return NextResponse.json(data);
		} else {
			return NextResponse.json(
				{ error: "Luno API returned unexpected or empty data." },
				{ status: 502 }
			);
		}
	} catch (error: unknown) {
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

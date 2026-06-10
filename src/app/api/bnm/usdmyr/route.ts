import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface BnmExchangeRate {
	currency_code: string;
	unit: number;
	rate: {
		date: string;
		buying_rate: number | null;
		selling_rate: number | null;
		middle_rate: number | null;
	};
}

export interface BnmApiResponse {
	data: BnmExchangeRate[];
	meta: {
		quote: string;
		session: string;
		last_updated: string;
		total_result: number;
	};
}

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = await fetcher<BnmApiResponse>(
			"https://api.bnm.gov.my/public/exchange-rate",
			"BNM API error",
			{
				headers: {
					Accept: "application/vnd.BNM.API.v1+json",
				},
			}
		);

		if (data && data.data) {
			const usdRate = data.data.find(
				(rate) => rate.currency_code === "USD"
			);

			if (usdRate) {
				return NextResponse.json(usdRate);
			} else {
				return NextResponse.json(
					{ error: "USD/MYR rate not found in BNM API response." },
					{ status: 404 }
				);
			}
		} else {
			return NextResponse.json(
				{ error: "BNM API returned unexpected data structure." },
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: `Failed to fetch BNM USD/MYR rate: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

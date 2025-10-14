import { NextResponse } from "next/server";
import { fetcher } from "@/lib/api";

export interface HataExchangeInfoData {
	base: string;
	quote: string;
	txpair: string;
	price: string;
	quote_volume: string;
}

export interface HataOrderBookData {
	asks: Array<{ price: string; qty: string }>;
	bids: Array<{ price: string; qty: string }>;
}

export interface HataApiResponse {
	exchangeInfo: HataExchangeInfoData | undefined;
	orderBook: HataOrderBookData | undefined;
}

export async function GET(
	request: Request,
	{ params }: { params: { pair: string } }
) {
	const { pair } = await params;
	const upperCasePair = pair.toUpperCase();

	try {
		// Fetch exchange info
		const exchangeInfoResponse = await fetcher<{
			data: HataExchangeInfoData[];
		}>(
			`https://my-api.hata.io/orderbook/api/v2/exchange-info`,
			"Hata Exchange Info API error"
		);

		const exchangeInfo = exchangeInfoResponse.data.find(
			(item) => item.txpair === upperCasePair
		);

		// Fetch order book
		const orderBookResponse = await fetcher<{ data: HataOrderBookData }>(
			`https://my-api.hata.io/orderbook/api/orderbook?pair_name=${upperCasePair}`,
			"Hata Order Book API error"
		);

		const orderBook = orderBookResponse.data;

		if (exchangeInfo || orderBook) {
			return NextResponse.json({ exchangeInfo, orderBook });
		} else {
			return NextResponse.json(
				{
					error: "Hata API returned unexpected data structure or pair not found.",
				},
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		console.error(`Error fetching Hata data for ${upperCasePair}:`, error);
		return NextResponse.json(
			{
				error: `Failed to fetch Hata data: ${
					error instanceof Error
						? error.message
						: "An unknown error occurred"
				}`,
			},
			{ status: 500 }
		);
	}
}

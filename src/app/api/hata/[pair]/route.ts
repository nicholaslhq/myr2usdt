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

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ pair: string }> }
) {
	const { pair } = await params;
	const upperCasePair = pair.toUpperCase();

	try {
		// Fetch exchange info and order book concurrently
		const commonHeaders = {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Accept: "application/json",
			},
		};

		const [exchangeInfoResponse, orderBookResponse] = await Promise.all([
			fetcher<{
				data: HataExchangeInfoData[];
			}>(
				"https://my-api.hata.io/orderbook/api/v2/exchange-info",
				"Hata Exchange Info API error",
				commonHeaders
			),
			fetcher<{ data: HataOrderBookData }>(
				`https://my-api.hata.io/orderbook/api/orderbook?pair_name=${upperCasePair}`,
				"Hata Order Book API error",
				commonHeaders
			),
		]);

		const exchangeInfo = exchangeInfoResponse.data.find(
			(item) => item.txpair === upperCasePair
		);

		const orderBook = orderBookResponse.data;

		if (exchangeInfo || orderBook) {
			const filteredPair = exchangeInfo
				? {
						base: exchangeInfo.base,
						quote: exchangeInfo.quote,
						txpair: exchangeInfo.txpair,
						price: exchangeInfo.price,
						quote_volume: exchangeInfo.quote_volume,
					}
				: undefined;

			return NextResponse.json({
				exchangeInfo: filteredPair,
				orderBook,
			});
		} else {
			return NextResponse.json(
				{
					error: "Hata API returned unexpected or empty data.",
				},
				{ status: 502 }
			);
		}
	} catch (error: unknown) {
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

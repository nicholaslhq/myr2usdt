"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
	fetchLunoPrice,
	fetchBinancePrice,
	fetchHuobiPrice,
	fetchHataPrice,
	fetchCoinGeckoPrice,
	fetchCoinbasePrice,
	fetchBnmPrice,
	MarketDetail,
	ExchangeRateDetails,
	HistoricalRate,
} from "../lib/api";
import { BnmExchangeRate } from "../app/api/bnm/usdmyr/route";
import { Card, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import ExchangeRateDisplay from "@/components/ExchangeRateDisplay";
import ExternalRatesBadges from "@/components/ExternalRatesBadges";
import PlatformAssetSelectors from "@/components/PlatformAssetSelectors";
import ExchangeDetailsDialog from "@/components/ExchangeDetailsDialog";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import { RefreshCw, ChartSpline } from "lucide-react";

export default function Home() {
	const [sourcePlatform, setSourcePlatform] = useState("luno");
	const [targetPlatform, setTargetPlatform] = useState("binance");
	const [cryptoAsset, setCryptoAsset] = useState("xrp");
	const [exchangeRateDetails, setExchangeRateDetails] =
		useState<ExchangeRateDetails | null>(null);
	const [previousExchangeRate, setPreviousExchangeRate] = useState<
		number | null
	>(null);
	const [rateChangeAnimation, setRateChangeAnimation] = useState<
		"green-pulse" | "red-pulse" | ""
	>("");
	const [loading, setLoading] = useState(false);
	const [coinGeckoRate, setCoinGeckoRate] = useState<number | null>(null);
	const [coinbaseRate, setCoinbaseRate] = useState<number | null>(null);
	const [bnmRate, setBnmRate] = useState<BnmExchangeRate | null>(null);
	const [coinGeckoDiff, setCoinGeckoDiff] = useState<number | null>(null);
	const [coinbaseDiff, setCoinbaseDiff] = useState<number | null>(null);
	const [bnmDiff, setBnmDiff] = useState<number | null>(null);
	const [hasError, setHasError] = useState(false);
	const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>(
		[]
	);
	const [showChart, setShowChart] = useState(false);

	const exchangeRateDetailsRef = useRef(exchangeRateDetails);

	useEffect(() => {
		exchangeRateDetailsRef.current = exchangeRateDetails;
	}, [exchangeRateDetails]);

	const calculateExchangeRate = useCallback(async () => {
		setLoading(true);
		setHasError(false); // Reset error state at the beginning of a new calculation

		try {
			let sourceData: MarketDetail;
			let targetData: MarketDetail;

			// Fetch price from source platform (Luno/Hata - MYR)
			if (sourcePlatform === "luno") {
				const lunoPair = `${cryptoAsset.toUpperCase()}MYR`;
				sourceData = await fetchLunoPrice(lunoPair);
			} else if (sourcePlatform === "hata") {
				const hataPair = `${cryptoAsset.toUpperCase()}MYR`;
				sourceData = await fetchHataPrice(hataPair);
			} else {
				throw new Error("Unsupported source platform.");
			}

			// Fetch price from target platform (Binance/Huobi - USDT)
			if (targetPlatform === "binance") {
				const binanceSymbol = `${cryptoAsset.toUpperCase()}USDT`;
				targetData = await fetchBinancePrice(binanceSymbol);
			} else if (targetPlatform === "huobi") {
				const huobiSymbol = `${cryptoAsset.toLowerCase()}usdt`; // Huobi uses lowercase symbols
				targetData = await fetchHuobiPrice(huobiSymbol);
			} else {
				throw new Error("Unsupported target platform.");
			}

			if (sourceData.price && targetData.price) {
				const rate = sourceData.price / targetData.price;

				if (exchangeRateDetailsRef.current?.rate) {
					setPreviousExchangeRate(
						exchangeRateDetailsRef.current.rate
					);
				} else {
					setPreviousExchangeRate(null);
				}

				setExchangeRateDetails({
					rate,
					source: {
						platform:
							sourcePlatform.charAt(0).toUpperCase() +
							sourcePlatform.slice(1),
						price: sourceData.price,
						timestamp: sourceData.timestamp,
						bid: sourceData.bid,
						ask: sourceData.ask,
						volume: sourceData.volume,
					},
					target: {
						platform:
							targetPlatform.charAt(0).toUpperCase() +
							targetPlatform.slice(1),
						price: targetData.price,
						timestamp: targetData.timestamp,
						bid: targetData.bid,
						ask: targetData.ask,
						volume: targetData.volume,
					},
				});

				// Store historical rate
				setHistoricalRates((prevRates) => [
					...prevRates,
					{ rate, timestamp: Date.now() },
				]);
			} else {
				throw new Error("Could not fetch prices for both platforms.");
			}

			// Fetch external rates concurrently using Promise.allSettled to handle individual errors
			const [coingeckoResult, coinbaseResult, bnmResult] =
				await Promise.allSettled([
					fetchCoinGeckoPrice(),
					fetchCoinbasePrice(),
					fetchBnmPrice(),
				]);

			setCoinGeckoRate(
				coingeckoResult.status === "fulfilled"
					? coingeckoResult.value
					: null
			);
			setCoinbaseRate(
				coinbaseResult.status === "fulfilled"
					? coinbaseResult.value
					: null
			);
			setBnmRate(
				bnmResult.status === "fulfilled" ? bnmResult.value : null
			);
		} catch (err: unknown) {
			setHasError(true); // Set error state to true
			toast.error("Oops! Something went wrong", {
				description:
					err instanceof Error
						? err.message
						: "An unknown error occurred.",
			});
		} finally {
			setLoading(false);
		}
	}, [sourcePlatform, targetPlatform, cryptoAsset]);

	useEffect(() => {
		if (rateChangeAnimation) {
			const timer = setTimeout(() => {
				setRateChangeAnimation("");
			}, 2000); // 2000ms matches the animation duration in globals.css
			return () => clearTimeout(timer);
		}
	}, [rateChangeAnimation]);

	useEffect(() => {
		if (!loading && exchangeRateDetails && previousExchangeRate !== null) {
			if (exchangeRateDetails.rate < previousExchangeRate) {
				setRateChangeAnimation("green-pulse");
			} else if (exchangeRateDetails.rate > previousExchangeRate) {
				setRateChangeAnimation("red-pulse");
			} else {
				// If rates are the same, clear any existing animation
				setRateChangeAnimation("");
			}
		} else if (
			!loading &&
			exchangeRateDetails &&
			previousExchangeRate === null
		) {
			// If it's the initial load and there's no previous rate, don't animate
			setRateChangeAnimation("");
		}
	}, [loading, exchangeRateDetails, previousExchangeRate]);

	useEffect(() => {
		// Auto-fetch and calculate rate on page load for the default pair
		calculateExchangeRate();

		// First refresh after 5 seconds
		const initialRefreshTimeout = setTimeout(() => {
			calculateExchangeRate();
			// Subsequent refreshes every 60 seconds
			const refreshInterval = setInterval(() => {
				calculateExchangeRate();
			}, 60000); // Refresh every 60 seconds
			return () => clearInterval(refreshInterval); // Cleanup for subsequent interval
		}, 5000); // Initial refresh after 5 seconds

		return () => clearTimeout(initialRefreshTimeout); // Cleanup for initial timeout
	}, [sourcePlatform, targetPlatform, cryptoAsset, calculateExchangeRate]); // Re-run when dropdowns change

	useEffect(() => {
		if (exchangeRateDetails?.rate) {
			const baseRate = exchangeRateDetails.rate;

			if (coinGeckoRate) {
				setCoinGeckoDiff(((coinGeckoRate - baseRate) / baseRate) * 100);
			}
			if (coinbaseRate) {
				setCoinbaseDiff(((coinbaseRate - baseRate) / baseRate) * 100);
			}
			if (bnmRate?.rate.middle_rate) {
				setBnmDiff(
					((bnmRate.rate.middle_rate - baseRate) / baseRate) * 100
				);
			}
		}
	}, [exchangeRateDetails, coinGeckoRate, coinbaseRate, bnmRate]);

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<AppHeader />

				<ExchangeRateDisplay
					exchangeRateDetails={exchangeRateDetails}
					loading={loading}
					hasError={hasError}
					rateChangeAnimation={rateChangeAnimation}
				/>

				{showChart && (
					<div className="transition-all duration-500 ease-in-out overflow-hidden">
						<ExchangeRateChart historicalRates={historicalRates} />
					</div>
				)}

				<ExternalRatesBadges
					coinGeckoRate={coinGeckoRate}
					coinGeckoDiff={coinGeckoDiff}
					coinbaseRate={coinbaseRate}
					coinbaseDiff={coinbaseDiff}
					bnmRate={bnmRate}
					bnmDiff={bnmDiff}
					loading={loading}
				/>

				<PlatformAssetSelectors
					sourcePlatform={sourcePlatform}
					setSourcePlatform={setSourcePlatform}
					targetPlatform={targetPlatform}
					setTargetPlatform={setTargetPlatform}
					cryptoAsset={cryptoAsset}
					setCryptoAsset={setCryptoAsset}
				/>

				<CardFooter className="flex w-full items-center gap-2">
					<ExchangeDetailsDialog
						exchangeRateDetails={exchangeRateDetails}
						loading={loading}
						cryptoAsset={cryptoAsset}
						className="flex-1"
					/>
					{historicalRates.length > 1 && (
						<Button
							onClick={() => setShowChart(!showChart)}
							className="flex-1"
							variant={showChart ? "secondary" : "outline"}
							aria-label="Toggle chart visibility"
						>
							<ChartSpline className="h-4 w-4" />
						</Button>
					)}
					<Button
						onClick={calculateExchangeRate}
						className="flex-1"
						disabled={
							loading || (!exchangeRateDetails && !hasError)
						}
						aria-label="Refresh exchange rate"
					>
						<RefreshCw
							className={
								loading
									? "h-4 w-4 animate-spin-slow"
									: "h-4 w-4"
							}
						/>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

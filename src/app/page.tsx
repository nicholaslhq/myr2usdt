"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { downsampleHistoricalRates } from "../lib/utils";
import { Card, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import ExchangeRateDisplay from "@/components/ExchangeRateDisplay";
import ExternalRatesBadges from "@/components/ExternalRatesBadges";
import PlatformAssetSelectors from "@/components/PlatformAssetSelectors";
import ExchangeDetailsDialog from "@/components/ExchangeDetailsDialog";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ExchangeRateChart = dynamic(
	() => import("@/components/ExchangeRateChart"),
	{
		loading: () => <Skeleton className="h-64 w-full" />,
		ssr: false,
	},
);
import { RefreshCw, ChartSpline } from "lucide-react";

const AUTO_REFRESH_INTERVAL = 60_000;
const ANIMATION_DURATION = 2000;

export default function Home() {
	const [sourcePlatform, setSourcePlatform] = useState("luno");
	const [targetPlatform, setTargetPlatform] = useState("binance");
	const [cryptoAsset, setCryptoAsset] = useState("xrp");
	const [inverted, setInverted] = useState(false);
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
		[],
	);
	const [showChart, setShowChart] = useState(false);

	const exchangeRateDetailsRef = useRef(exchangeRateDetails);
	const prevRateRef = useRef<number | null>(null);

	useEffect(() => {
		exchangeRateDetailsRef.current = exchangeRateDetails;
		prevRateRef.current = previousExchangeRate;
	}, [exchangeRateDetails, previousExchangeRate]);

	const calculateExchangeRate = useCallback(async () => {
		setLoading(true);
		setHasError(false);

		try {
			let sourceData: MarketDetail;
			let targetData: MarketDetail;

			// Fetch source platform price
			if (sourcePlatform === "luno") {
				sourceData = await fetchLunoPrice(
					`${cryptoAsset.toUpperCase()}MYR`,
				);
			} else {
				sourceData = await fetchHataPrice(
					`${cryptoAsset.toUpperCase()}MYR`,
				);
			}

			// Fetch target platform price
			if (targetPlatform === "binance") {
				targetData = await fetchBinancePrice(
					`${cryptoAsset.toUpperCase()}USDT`,
				);
			} else {
				targetData = await fetchHuobiPrice(
					`${cryptoAsset.toLowerCase()}usdt`,
				);
			}

			if (sourceData.price && targetData.price) {
				const rate = sourceData.price / targetData.price;
				const prevRate = prevRateRef.current;
				setPreviousExchangeRate(prevRate);

				const sourceName =
					sourcePlatform.charAt(0).toUpperCase() +
					sourcePlatform.slice(1);
				const targetName =
					targetPlatform.charAt(0).toUpperCase() +
					targetPlatform.slice(1);

				setExchangeRateDetails({
					rate,
					source: {
						platform: sourceName,
						price: sourceData.price,
						timestamp: sourceData.timestamp,
						bid: sourceData.bid,
						ask: sourceData.ask,
						volume: sourceData.volume,
					},
					target: {
						platform: targetName,
						price: targetData.price,
						timestamp: targetData.timestamp,
						bid: targetData.bid,
						ask: targetData.ask,
						volume: targetData.volume,
					},
				});

				// Update historical rates efficiently
				const now = Date.now();
				const newRatePoint: HistoricalRate = {
					rate,
					timestamp: now,
					sourcePlatform: sourceName,
					targetPlatform: targetName,
					cryptoAsset: cryptoAsset.toUpperCase(),
				};

				setHistoricalRates((prevRates) => {
					const updated = [...prevRates, newRatePoint];
					return downsampleHistoricalRates(updated, now);
				});
			} else {
				throw new Error("Could not fetch prices for both platforms.");
			}

			// Fetch external rates concurrently
			const [coingeckoResult, coinbaseResult, bnmResult] =
				await Promise.allSettled([
					fetchCoinGeckoPrice(),
					fetchCoinbasePrice(),
					fetchBnmPrice(),
				]);

			// Batch external state updates
			setCoinGeckoRate(
				coingeckoResult.status === "fulfilled"
					? coingeckoResult.value
					: null,
			);
			setCoinbaseRate(
				coinbaseResult.status === "fulfilled"
					? coinbaseResult.value
					: null,
			);
			setBnmRate(
				bnmResult.status === "fulfilled" ? bnmResult.value : null,
			);
		} catch (err: unknown) {
			setHasError(true);
			toast.error("Oops! Something went wrong", {
				description:
					err instanceof Error
						? err.message
						: "An unknown error occurred.",
			});
		} finally {
			refreshStartRef.current = Date.now();
			setProgress(0);
			setLoading(false);
		}
	}, [sourcePlatform, targetPlatform, cryptoAsset]);

	// Auto-fetch on mount and schedule periodic refresh
	const refreshStartRef = useRef<number>(Date.now());

	useEffect(() => {
		calculateExchangeRate();
		const refreshInterval = setInterval(
			calculateExchangeRate,
			AUTO_REFRESH_INTERVAL,
		);
		return () => clearInterval(refreshInterval);
	}, [calculateExchangeRate]);

	// Progress timer - uses ref only, no timestamp state
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			const elapsed = Date.now() - refreshStartRef.current;
			const p = Math.min(elapsed / AUTO_REFRESH_INTERVAL, 1);
			setProgress(p);
			if (p >= 1) {
				refreshStartRef.current = Date.now();
			}
		}, 50);

		return () => clearInterval(interval);
	}, []);

	// Animate rate changes
	useEffect(() => {
		if (!rateChangeAnimation) return;

		const timer = setTimeout(() => {
			setRateChangeAnimation("");
		}, ANIMATION_DURATION);
		return () => clearTimeout(timer);
	}, [rateChangeAnimation]);

	// Detect rate direction for animation
	useEffect(() => {
		if (loading || !exchangeRateDetails || previousExchangeRate === null)
			return;

		if (exchangeRateDetails.rate < previousExchangeRate) {
			setRateChangeAnimation("green-pulse");
		} else if (exchangeRateDetails.rate > previousExchangeRate) {
			setRateChangeAnimation("red-pulse");
		} else {
			setRateChangeAnimation("");
		}
	}, [loading, exchangeRateDetails, previousExchangeRate]);

	// Calculate percentage differences - memoized computation
	useEffect(() => {
		if (!exchangeRateDetails?.rate) {
			setCoinGeckoDiff(null);
			setCoinbaseDiff(null);
			setBnmDiff(null);
			return;
		}

		const baseRate = exchangeRateDetails.rate;
		setCoinGeckoDiff(
			coinGeckoRate
				? ((coinGeckoRate - baseRate) / baseRate) * 100
				: null,
		);
		setCoinbaseDiff(
			coinbaseRate ? ((coinbaseRate - baseRate) / baseRate) * 100 : null,
		);
		setBnmDiff(
			bnmRate?.rate.middle_rate
				? ((bnmRate.rate.middle_rate - baseRate) / baseRate) * 100
				: null,
		);
	}, [exchangeRateDetails, coinGeckoRate, coinbaseRate, bnmRate]);

	// Memoized derived values
	const canShowChart = historicalRates.length > 1;

	const chartProps = useMemo(() => ({ historicalRates, inverted }), [historicalRates, inverted]);

	const detailsDialogProps = useMemo(
		() => ({
			exchangeRateDetails,
			loading,
			cryptoAsset,
			className: "flex-1 cursor-pointer",
		}),
		[exchangeRateDetails, loading, cryptoAsset],
	);

	const badgesProps = useMemo(
		() => ({
			coinGeckoRate,
			coinGeckoDiff,
			coinbaseRate,
			coinbaseDiff,
			bnmRate,
			bnmDiff,
			loading,
			inverted,
		}),
		[
			coinGeckoRate,
			coinGeckoDiff,
			coinbaseRate,
			coinbaseDiff,
			bnmRate,
			bnmDiff,
			loading,
			inverted,
		],
	);

	const selectorsProps = useMemo(
		() => ({
			sourcePlatform,
			setSourcePlatform,
			targetPlatform,
			setTargetPlatform,
			cryptoAsset,
			setCryptoAsset,
		}),
		[sourcePlatform, targetPlatform, cryptoAsset],
	);

	const displayProps = useMemo(
		() => ({
			exchangeRateDetails,
			loading,
			hasError,
			rateChangeAnimation,
			inverted,
		}),
		[exchangeRateDetails, loading, hasError, rateChangeAnimation, inverted],
	);

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<AppHeader inverted={inverted} onToggleInversion={() => setInverted(!inverted)} />

				<ExchangeRateDisplay {...displayProps} />

				{showChart && (
					<div className="transition-all duration-500 ease-in-out overflow-hidden">
						<ExchangeRateChart {...chartProps} />
					</div>
				)}

				<ExternalRatesBadges {...badgesProps} />

				<PlatformAssetSelectors {...selectorsProps} />

				<CardFooter className="flex w-full items-center gap-2">
					<div className="flex w-1/2 gap-2">
						<ExchangeDetailsDialog {...detailsDialogProps} />
						{canShowChart && (
							<Button
								onClick={() => setShowChart(!showChart)}
								className="flex-1 cursor-pointer"
								variant={showChart ? "secondary" : "outline"}
								aria-label="Toggle chart visibility"
							>
								<ChartSpline className="h-4 w-4" />
							</Button>
						)}
					</div>
					<Button
						onClick={calculateExchangeRate}
						className="relative flex-1 overflow-hidden cursor-pointer"
						disabled={
							loading || (!exchangeRateDetails && !hasError)
						}
						aria-label="Refresh exchange rate"
					>
						<div
							className="absolute inset-0 opacity-20 transition-all duration-75 ease-linear"
							style={{
								width: `${progress * 100}%`,
								backgroundColor: "currentColor",
							}}
						/>
						<span className="relative z-10 flex items-center justify-center">
							<RefreshCw
								className={
									loading
										? "h-4 w-4 animate-spin-slow"
										: "h-4 w-4"
								}
							/>
						</span>
					</Button>
				</CardFooter>
			</Card>
			<footer className="mt-6 text-center text-sm text-gray-500">
				Created by{" "}
				<a
					href="https://nlhq.vercel.app/"
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-primary transition-colors"
				>
					Nicholas
				</a>
			</footer>
		</div>
	);
}

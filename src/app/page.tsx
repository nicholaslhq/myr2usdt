"use client";
import { useState, useEffect, useCallback } from "react";
import NumberFlow from "@number-flow/react";
import Image from "next/image";
import { ArrowRight, CircleDollarSign, Info, RefreshCw } from "lucide-react";
import {
	fetchLunoPrice,
	fetchBinancePrice,
	fetchHuobiPrice,
	fetchHataPrice,
	fetchCoinGeckoPrice,
	fetchCoinbasePrice,
	fetchBnmPrice,
	MarketDetail,
} from "../lib/api";
import { BnmExchangeRate } from "../app/api/bnm/usdmyr/route";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../components/ui/tooltip";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

interface ExchangeRateDetails {
	rate: number;
	source: {
		platform: string;
		price: number;
		timestamp: number;
		bid?: number;
		ask?: number;
		volume?: number;
	};
	target: {
		platform: string;
		price: number;
		timestamp: number;
		bid?: number;
		ask?: number;
		volume?: number;
	};
}

export default function Home() {
	const [sourcePlatform, setSourcePlatform] = useState("luno");
	const [targetPlatform, setTargetPlatform] = useState("binance");
	const [cryptoAsset, setCryptoAsset] = useState("xrp");
	const [exchangeRateDetails, setExchangeRateDetails] =
		useState<ExchangeRateDetails | null>(null);
	const [loading, setLoading] = useState(false);
	const [coinGeckoRate, setCoinGeckoRate] = useState<number | null>(null);
	const [coinbaseRate, setCoinbaseRate] = useState<number | null>(null);
	const [bnmRate, setBnmRate] = useState<BnmExchangeRate | null>(null);

	const calculateExchangeRate = useCallback(async () => {
		setLoading(true);

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
			} else {
				throw new Error("Could not fetch prices for both platforms.");
			}
		} catch (err: unknown) {
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
		const getCoinGeckoRate = async () => {
			try {
				const price = await fetchCoinGeckoPrice();
				setCoinGeckoRate(price);
			} catch (err: unknown) {
				toast.error("Error fetching CoinGecko price", {
					description:
						err instanceof Error
							? err.message
							: "An unknown error occurred.",
				});
			}
		};
		getCoinGeckoRate();

		const getCoinbaseRate = async () => {
			try {
				const price = await fetchCoinbasePrice();
				setCoinbaseRate(price);
			} catch (err: unknown) {
				toast.error("Error fetching Coinbase price", {
					description:
						err instanceof Error
							? err.message
							: "An unknown error occurred.",
				});
			}
		};
		getCoinbaseRate();

		const getBnmUsdMyrPrice = async () => {
			try {
				const rate = await fetchBnmPrice();
				setBnmRate(rate);
			} catch (err: unknown) {
				toast.error("Error fetching BNM price", {
					description:
						err instanceof Error
							? err.message
							: "An unknown error occurred.",
				});
			}
		};
		getBnmUsdMyrPrice();

		// Auto-fetch and calculate rate on page load for the default pair
		calculateExchangeRate();
	}, [sourcePlatform, targetPlatform, cryptoAsset, calculateExchangeRate]); // Re-run when dropdowns change

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="flex items-center justify-center">
					<CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
						<Image
							src="/favicon/favicon.svg"
							alt="MYR2USDT Logo"
							width={24}
							height={24}
							className="h-6 w-6"
						/>
						<span>MYR2USDT</span>
					</CardTitle>
				</CardHeader>

				{exchangeRateDetails ? (
					<CardContent>
						<div id="exchange-rate" className="text-center">
							<NumberFlow
								value={parseFloat(
									exchangeRateDetails.rate.toFixed(4)
								)}
								format={{
									notation: "standard",
									maximumFractionDigits: 4,
									minimumFractionDigits: 4,
								}}
								className={`text-center text-8xl font-semibold ${
									loading ? "opacity-50" : ""
								}`}
							/>
						</div>
					</CardContent>
				) : (
					<CardContent>
						<Skeleton className="h-24 my-6 w-full" />
					</CardContent>
				)}

				<CardContent className="mt-4 flex justify-center space-x-2">
					{coinGeckoRate ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href="https://www.coingecko.com/en/coins/tether/myr"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Badge
										variant="secondary"
										className="text-sm"
									>
										<Avatar className="size-6">
											<AvatarImage
												src="/images/coingecko-logo.webp"
												alt="CoinGecko"
											/>
											<AvatarFallback>CG</AvatarFallback>
										</Avatar>
										<span className="text-sm font-medium">
											{coinGeckoRate.toFixed(4)}
										</span>
									</Badge>
								</a>
							</TooltipTrigger>
							<TooltipContent>
								<p>CoinGecko USDT/MYR price</p>
							</TooltipContent>
						</Tooltip>
					) : (
						<Skeleton className="h-8 w-24" />
					)}
					{coinbaseRate ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href="https://www.coinbase.com/converter/usdt/myr"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Badge
										variant="secondary"
										className="text-sm"
									>
										<Avatar className="size-6">
											<AvatarImage
												src="/images/coinbase-logo.webp"
												alt="Coinbase"
											/>
											<AvatarFallback>CB</AvatarFallback>
										</Avatar>
										<span className="text-sm font-medium">
											{coinbaseRate.toFixed(4)}
										</span>
									</Badge>
								</a>
							</TooltipTrigger>
							<TooltipContent>
								<p>Coinbase USDT/MYR price</p>
							</TooltipContent>
						</Tooltip>
					) : (
						<Skeleton className="h-8 w-24" />
					)}
					{bnmRate?.rate.middle_rate ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href="https://www.bnm.gov.my/exchange-rates#:~:text=USD"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Badge
										variant="secondary"
										className="text-sm"
									>
										<Avatar className="size-6">
											<AvatarImage
												src="/images/bnm-logo.webp"
												alt="BNM"
											/>
											<AvatarFallback>BNM</AvatarFallback>
										</Avatar>
										<span className="text-sm font-medium">
											{bnmRate.rate.middle_rate.toFixed(
												4
											)}
										</span>
									</Badge>
								</a>
							</TooltipTrigger>
							<TooltipContent>
								<p>Bank Negara Malaysia USD/MYR middle rate</p>
							</TooltipContent>
						</Tooltip>
					) : (
						<Skeleton className="h-8 w-24" />
					)}
				</CardContent>

				<CardContent className="flex items-center justify-center space-x-2">
					<Select
						value={sourcePlatform}
						onValueChange={(value) => {
							setSourcePlatform(value);
						}}
					>
						<SelectTrigger
							id="source-platform"
							className="w-[120px]"
						>
							<SelectValue placeholder="Source" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Source</SelectLabel>
								<SelectItem value="luno">Luno</SelectItem>
								<SelectItem value="hata">Hata</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>

					<ArrowRight className="h-5 w-5 text-gray-700" />

					<Select
						value={targetPlatform}
						onValueChange={(value) => {
							setTargetPlatform(value);
						}}
					>
						<SelectTrigger
							id="target-platform"
							className="w-[120px]"
						>
							<SelectValue placeholder="Target" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Target</SelectLabel>
								<SelectItem value="binance">Binance</SelectItem>
								<SelectItem value="huobi">Huobi</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>

					<CircleDollarSign className="h-5 w-5 text-gray-700" />

					<Select
						value={cryptoAsset}
						onValueChange={(value) => {
							setCryptoAsset(value);
						}}
					>
						<SelectTrigger id="crypto-asset" className="w-[100px]">
							<SelectValue placeholder="Asset" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Crypto</SelectLabel>
								<SelectItem value="xrp">XRP</SelectItem>
								<SelectItem value="btc">BTC</SelectItem>
								<SelectItem value="eth">ETH</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</CardContent>

				<CardFooter className="flex justify-center items-center gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								className="text-sm w-1/2"
								size="icon"
								disabled={!exchangeRateDetails}
							>
								<Info className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Exchange Details</DialogTitle>
								<DialogDescription>
									Detailed information about the exchange
									rate.
								</DialogDescription>
							</DialogHeader>
							{loading && !exchangeRateDetails ? (
								<div className="grid gap-4 py-4">
									<Skeleton className="h-12 w-3/4" />
									<Skeleton className="h-8 w-full" />
									<Skeleton className="h-8 w-full" />
									<Skeleton className="h-8 w-full" />
									<Separator />
									<Skeleton className="h-12 w-3/4" />
									<Skeleton className="h-8 w-full" />
									<Skeleton className="h-8 w-full" />
									<Skeleton className="h-8 w-full" />
								</div>
							) : exchangeRateDetails ? (
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="col-span-2 text-lg font-semibold flex items-center gap-2">
											Source
											<Badge variant="secondary">
												{
													exchangeRateDetails.source
														.platform
												}
											</Badge>
											<Badge variant="secondary">
												{cryptoAsset.toUpperCase()}
											</Badge>
										</div>
										<div className="col-span-1">
											<p className="text-sm font-medium">
												Price:
											</p>
											<p className="text-sm">
												{exchangeRateDetails.source.price.toFixed(
													4
												)}{" "}
												MYR
											</p>
										</div>
										{exchangeRateDetails.source.volume && (
											<div className="col-span-1">
												<p className="text-sm font-medium">
													Volume:
												</p>
												<p className="text-sm">
													{
														exchangeRateDetails
															.source.volume
													}
												</p>
											</div>
										)}
										{exchangeRateDetails.source.bid && (
											<div className="col-span-1">
												<p className="text-sm font-medium">
													Bid:
												</p>
												<p className="text-sm">
													{exchangeRateDetails.source.bid.toFixed(
														4
													)}{" "}
													MYR
												</p>
											</div>
										)}
										{exchangeRateDetails.source.ask && (
											<div className="col-span-1">
												<p className="text-sm font-medium">
													Ask:
												</p>
												<p className="text-sm">
													{exchangeRateDetails.source.ask.toFixed(
														4
													)}{" "}
													MYR
												</p>
											</div>
										)}
										<div className="col-span-2">
											<p className="text-sm font-medium">
												Datetime:
											</p>
											<p className="text-sm">
												{new Date(
													exchangeRateDetails.source.timestamp
												).toLocaleString()}
											</p>
										</div>
									</div>

									<Separator />

									<div className="grid grid-cols-2 gap-4">
										<div className="col-span-2 text-lg font-semibold flex items-center gap-2">
											Target
											<Badge variant="secondary">
												{
													exchangeRateDetails.target
														.platform
												}
											</Badge>
											<Badge variant="secondary">
												{cryptoAsset.toUpperCase()}
											</Badge>
										</div>
										<div className="col-span-1">
											<p className="text-sm font-medium">
												Price:
											</p>
											<p className="text-sm">
												{exchangeRateDetails.target.price.toFixed(
													4
												)}{" "}
												USDT
											</p>
										</div>
										{exchangeRateDetails.target.volume && (
											<div className="col-span-1">
												<p className="text-sm font-medium">
													Volume:
												</p>
												<p className="text-sm">
													{
														exchangeRateDetails
															.target.volume
													}
												</p>
											</div>
										)}
										{exchangeRateDetails.target.bid && (
											<div className="col-span-1">
												<p className="text-sm font-medium">
													Bid:
												</p>
												<p className="text-sm">
													{exchangeRateDetails.target.bid.toFixed(
														4
													)}{" "}
													USDT
												</p>
											</div>
										)}
										{exchangeRateDetails.target.ask && (
											<div className="col-span-1">
												<p className="text-sm font-medium">
													Ask:
												</p>
												<p className="text-sm">
													{exchangeRateDetails.target.ask.toFixed(
														4
													)}{" "}
													USDT
												</p>
											</div>
										)}
										<div className="col-span-2">
											<p className="text-sm font-medium">
												Datetime:
											</p>
											<p className="text-sm">
												{new Date(
													exchangeRateDetails.target.timestamp
												).toLocaleString()}
											</p>
										</div>
									</div>
								</div>
							) : null}
							<DialogFooter>
								<DialogClose asChild>
									<Button type="button">Close</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<Button
						onClick={calculateExchangeRate}
						className="w-1/2"
						disabled={loading || !exchangeRateDetails}
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

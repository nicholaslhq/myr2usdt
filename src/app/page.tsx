"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
	fetchLunoPrice,
	fetchBinancePrice,
	fetchHuobiPrice,
	fetchCoinGeckoPrice,
	fetchBnmPrice,
	MarketDetail,
} from "../lib/api";
import { BnmExchangeRate } from "../app/api/bnm/usdmyr/route";

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
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [usdtMyrPrice, setUsdtMyrPrice] = useState<number | null>(null);
	const [usdMyrRate, setUsdMyrRate] = useState<BnmExchangeRate | null>(null);

	useEffect(() => {
		const getUsdtMyrPrice = async () => {
			try {
				const price = await fetchCoinGeckoPrice();
				setUsdtMyrPrice(price);
			} catch (err) {
				console.error("Error fetching CoinGecko USDT/MYR price:", err);
			}
		};
		getUsdtMyrPrice();

		const getBnmUsdMyrPrice = async () => {
			try {
				const rate = await fetchBnmPrice();
				setUsdMyrRate(rate);
			} catch (err) {
				console.error("Error fetching BNM USD/MYR price:", err);
			}
		};
		getBnmUsdMyrPrice();

		// Auto-fetch and calculate rate on page load for the default pair
		calculateExchangeRate();
	}, []); // Run once on component mount

	const calculateExchangeRate = async () => {
		setLoading(true);
		setError(null);
		setExchangeRateDetails(null);
		setShowDetails(false);

		try {
			let lunoData: MarketDetail;
			let targetData: MarketDetail;

			// Fetch price from source platform (Luno - MYR)
			if (sourcePlatform === "luno") {
				const lunoPair = `${cryptoAsset.toUpperCase()}MYR`;
				lunoData = await fetchLunoPrice(lunoPair);
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

			if (lunoData.price && targetData.price) {
				const rate = lunoData.price / targetData.price;
				setExchangeRateDetails({
					rate,
					source: {
						platform: "Luno",
						price: lunoData.price,
						timestamp: lunoData.timestamp,
						bid: lunoData.bid,
						ask: lunoData.ask,
						volume: lunoData.volume,
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
			setError(
				err instanceof Error
					? err.message
					: "An unknown error occurred."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
			<main className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
				<h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
					MYR2USDT
				</h1>

				<div className="mb-4">
					<label
						htmlFor="source-platform"
						className="block text-gray-700 text-sm font-semibold mb-2"
					>
						Source Platform (MYR):
					</label>
					<div className="relative">
						<select
							id="source-platform"
							className="block appearance-none w-full bg-gray-100 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition duration-200 ease-in-out"
							value={sourcePlatform}
							onChange={(e) => setSourcePlatform(e.target.value)}
						>
							<option value="luno">Luno</option>
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
							<svg
								className="fill-current h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
							>
								<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="mb-4">
					<label
						htmlFor="target-platform"
						className="block text-gray-700 text-sm font-semibold mb-2"
					>
						Target Platform (USDT):
					</label>
					<div className="relative">
						<select
							id="target-platform"
							className="block appearance-none w-full bg-gray-100 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition duration-200 ease-in-out"
							value={targetPlatform}
							onChange={(e) => setTargetPlatform(e.target.value)}
						>
							<option value="binance">Binance</option>
							<option value="huobi">Huobi</option>
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
							<svg
								className="fill-current h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
							>
								<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<label
						htmlFor="crypto-asset"
						className="block text-gray-700 text-sm font-semibold mb-2"
					>
						Crypto Asset:
					</label>
					<div className="relative">
						<select
							id="crypto-asset"
							className="block appearance-none w-full bg-gray-100 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition duration-200 ease-in-out"
							value={cryptoAsset}
							onChange={(e) => setCryptoAsset(e.target.value)}
						>
							<option value="xrp">XRP</option>
							<option value="btc">BTC</option>
							<option value="eth">ETH</option>
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
							<svg
								className="fill-current h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
							>
								<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
							</svg>
						</div>
					</div>
				</div>

				<button
					onClick={calculateExchangeRate}
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{loading ? "Calculating..." : "Fetch & Calculate Rate"}
				</button>

				{error && (
					<div className="text-red-500 text-center mt-4">{error}</div>
				)}

				{usdtMyrPrice && (
					<div className="mt-4 p-3 bg-green-50 rounded-lg text-center text-md font-semibold text-green-800 border border-green-200">
						CoinGecko USDT/MYR: {usdtMyrPrice.toFixed(4)} MYR
					</div>
				)}

				{usdMyrRate && usdMyrRate.rate.middle_rate && (
					<div className="mt-4 p-3 bg-purple-50 rounded-lg text-center text-md font-semibold text-purple-800 border border-purple-200">
						BNM USD/MYR: {usdMyrRate.rate.middle_rate.toFixed(4)}{" "}
						MYR
					</div>
				)}

				{exchangeRateDetails && (
					<div
						id="exchange-rate"
						className="mt-6 p-4 bg-blue-50 rounded-lg text-center text-xl font-bold text-blue-800 border border-blue-200"
					>
						Effective Exchange Rate (MYR → USDT):{" "}
						{exchangeRateDetails.rate.toFixed(4)}
						<div>
							<button
								onClick={() => setShowDetails(!showDetails)}
								className="ml-2 text-blue-600 hover:text-blue-800 text-sm focus:outline-none"
							>
								{showDetails ? "Hide Details" : "Show Details"}
							</button>
						</div>
						{showDetails && (
							<div className="text-sm text-gray-700 mt-4 text-left">
								<h3 className="font-bold text-md mb-2 text-blue-700">
									Exchange Details:
								</h3>
								<div className="mb-2">
									<p>
										<span className="font-semibold">
											Source Platform (
											{
												exchangeRateDetails.source
													.platform
											}
											):
										</span>{" "}
										{exchangeRateDetails.source.price.toFixed(
											4
										)}{" "}
										MYR
									</p>
									{exchangeRateDetails.source.bid && (
										<p className="ml-4">
											Bid:{" "}
											{exchangeRateDetails.source.bid.toFixed(
												4
											)}{" "}
											MYR
										</p>
									)}
									{exchangeRateDetails.source.ask && (
										<p className="ml-4">
											Ask:{" "}
											{exchangeRateDetails.source.ask.toFixed(
												4
											)}{" "}
											MYR
										</p>
									)}
									{exchangeRateDetails.source.volume && (
										<p className="ml-4">
											Volume:{" "}
											{exchangeRateDetails.source.volume}
										</p>
									)}
									<p className="ml-4">
										Datetime:{" "}
										{new Date(
											exchangeRateDetails.source.timestamp
										).toLocaleString()}
									</p>
								</div>
								<div>
									<p>
										<span className="font-semibold">
											Target Platform (
											{
												exchangeRateDetails.target
													.platform
											}
											):
										</span>{" "}
										{exchangeRateDetails.target.price.toFixed(
											4
										)}{" "}
										USDT
									</p>
									{exchangeRateDetails.target.bid && (
										<p className="ml-4">
											Bid:{" "}
											{exchangeRateDetails.target.bid.toFixed(
												4
											)}{" "}
											USDT
										</p>
									)}
									{exchangeRateDetails.target.ask && (
										<p className="ml-4">
											Ask:{" "}
											{exchangeRateDetails.target.ask.toFixed(
												4
											)}{" "}
											USDT
										</p>
									)}
									{exchangeRateDetails.target.volume && (
										<p className="ml-4">
											Volume:{" "}
											{exchangeRateDetails.target.volume}
										</p>
									)}
									<p className="ml-4">
										Datetime:{" "}
										{new Date(
											exchangeRateDetails.target.timestamp
										).toLocaleString()}
									</p>
								</div>
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	);
}

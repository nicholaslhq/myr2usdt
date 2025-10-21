import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ExchangeRateDetails } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const EXCHANGE_URLS: { [key: string]: string } = {
	luno: "https://www.luno.com/trade/markets/",
	hata: "https://hata.io/my/exchange", // No direct pair link
	binance: "https://www.binance.com/en/trade/",
	huobi: "https://www.htx.com/trade/",
};

function getExchangeUrl(platform: string, cryptoAsset: string): string | null {
	const baseUrl = EXCHANGE_URLS[platform.toLowerCase()];
	if (!baseUrl) {
		return null;
	}

	switch (platform.toLowerCase()) {
		case "luno":
			return `${baseUrl}${cryptoAsset.toUpperCase()}MYR`;
		case "binance":
			return `${baseUrl}${cryptoAsset.toUpperCase()}_USDT?type=spot`;
		case "huobi":
			return `${baseUrl}${cryptoAsset.toLowerCase()}_usdt?type=spot`;
		case "hata":
			return baseUrl; // Hata has no direct pair link
		default:
			return null;
	}
}

interface ExchangeDetailsDialogProps {
	exchangeRateDetails: ExchangeRateDetails | null;
	loading: boolean;
	cryptoAsset: string;
}

export default function ExchangeDetailsDialog({
	exchangeRateDetails,
	loading,
	cryptoAsset,
}: ExchangeDetailsDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="text-sm w-1/3"
					size="icon"
					disabled={!exchangeRateDetails}
					aria-label="Exchange Details"
				>
					<Info className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Exchange Details</DialogTitle>
					<DialogDescription>
						Detailed information about the exchange rate.
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
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link
												href={
													getExchangeUrl(
														exchangeRateDetails
															.source.platform,
														cryptoAsset
													) || "#"
												}
												target="_blank"
												rel="noopener noreferrer"
												className={`flex items-center ${
													getExchangeUrl(
														exchangeRateDetails
															.source.platform,
														cryptoAsset
													)
														? "cursor-pointer"
														: "cursor-default"
												}`}
											>
												<Badge variant="secondary">
													{
														exchangeRateDetails
															.source.platform
													}
												</Badge>
											</Link>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												Visit{" "}
												{
													exchangeRateDetails.source
														.platform
												}{" "}
												official website in new tab
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<Badge variant="outline">
									{cryptoAsset.toUpperCase()}
								</Badge>
							</div>
							<div className="col-span-1">
								<p className="text-sm font-medium">Price:</p>
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
										{exchangeRateDetails.source.volume}
									</p>
								</div>
							)}
							{exchangeRateDetails.source.bid && (
								<div className="col-span-1">
									<p className="text-sm font-medium">Bid:</p>
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
									<p className="text-sm font-medium">Ask:</p>
									<p className="text-sm">
										{exchangeRateDetails.source.ask.toFixed(
											4
										)}{" "}
										MYR
									</p>
								</div>
							)}
							<div className="col-span-2">
								<p className="text-sm font-medium">Datetime:</p>
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
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link
												href={
													getExchangeUrl(
														exchangeRateDetails
															.target.platform,
														cryptoAsset
													) || "#"
												}
												target="_blank"
												rel="noopener noreferrer"
												className={`flex items-center ${
													getExchangeUrl(
														exchangeRateDetails
															.target.platform,
														cryptoAsset
													)
														? "cursor-pointer"
														: "cursor-default"
												}`}
											>
												<Badge variant="secondary">
													{
														exchangeRateDetails
															.target.platform
													}
												</Badge>
											</Link>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												Visit{" "}
												{
													exchangeRateDetails.target
														.platform
												}{" "}
												official website in new tab
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<Badge variant="outline">
									{cryptoAsset.toUpperCase()}
								</Badge>
							</div>
							<div className="col-span-1">
								<p className="text-sm font-medium">Price:</p>
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
										{exchangeRateDetails.target.volume}
									</p>
								</div>
							)}
							{exchangeRateDetails.target.bid && (
								<div className="col-span-1">
									<p className="text-sm font-medium">Bid:</p>
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
									<p className="text-sm font-medium">Ask:</p>
									<p className="text-sm">
										{exchangeRateDetails.target.ask.toFixed(
											4
										)}{" "}
										USDT
									</p>
								</div>
							)}
							<div className="col-span-2">
								<p className="text-sm font-medium">Datetime:</p>
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
	);
}

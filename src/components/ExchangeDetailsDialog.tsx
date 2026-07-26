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
import React, { memo } from "react";

const EXCHANGE_URLS: Record<string, string> = {
	luno: "https://www.luno.com/trade/markets/",
	hata: "https://hata.io/my/exchange",
	binance: "https://www.binance.com/en/trade/",
	huobi: "https://www.htx.com/trade/",
};

function getExchangeUrl(platform: string, cryptoAsset: string): string | null {
	const baseUrl = EXCHANGE_URLS[platform.toLowerCase()];
	if (!baseUrl) return null;

	switch (platform.toLowerCase()) {
		case "luno":
			return `${baseUrl}${cryptoAsset.toUpperCase()}MYR`;
		case "binance":
			return `${baseUrl}${cryptoAsset.toUpperCase()}_USDT?type=spot`;
		case "huobi":
			return `${baseUrl}${cryptoAsset.toLowerCase()}_usdt?type=spot`;
		case "hata":
			return baseUrl;
		default:
			return null;
	}
}

interface ExchangeDetailsDialogProps {
	exchangeRateDetails: ExchangeRateDetails | null;
	loading: boolean;
	cryptoAsset: string;
	className?: string;
	inverted: boolean;
}

function formatRate(val: number | undefined | null): string {
	return val !== undefined && val !== null ? val.toFixed(4) : "N/A";
}

function PriceField({
	name,
	value,
	unit,
}: {
	name: string;
	value: number | undefined | null;
	unit: string;
}) {
	return (
		<div className="col-span-1">
			<p className="text-sm font-medium">{name}:</p>
			<p className="text-sm">
				{formatRate(value)} {unit}
			</p>
		</div>
	);
}

function PlatformSection({
	label,
	data,
	currency,
	asset,
}: {
	label: string;
	data: ExchangeRateDetails["source"] | ExchangeRateDetails["target"];
	currency: string;
	asset: string;
}) {
	const url = getExchangeUrl(data.platform, asset);
	const isClickable = !!url;

	return (
		<>
			<div className="col-span-2 text-lg font-semibold flex items-center gap-2">
				{label}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href={url || "#"}
								target="_blank"
								rel="noopener noreferrer"
								className={`flex items-center ${
									isClickable
										? "cursor-pointer"
										: "cursor-default"
								}`}
							>
								<Badge variant="secondary">
									{data.platform}
								</Badge>
							</Link>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Visit {data.platform} official website in new
								tab
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<Badge variant="outline">{asset.toUpperCase()}</Badge>
			</div>
			<PriceField name="Price" value={data.price} unit={currency} />
			{data.volume && (
				<div className="col-span-1">
					<p className="text-sm font-medium">Volume:</p>
					<p className="text-sm">{data.volume}</p>
				</div>
			)}
			{data.bid !== undefined && (
				<PriceField name="Bid" value={data.bid} unit={currency} />
			)}
			{data.ask !== undefined && (
				<PriceField name="Ask" value={data.ask} unit={currency} />
			)}
			<div className="col-span-2">
				<p className="text-sm font-medium">Datetime:</p>
				<p className="text-sm">
					{new Date(data.timestamp).toLocaleString()}
				</p>
			</div>
		</>
	);
}

const ExchangeDetailsDialog = memo(function ExchangeDetailsDialog({
	exchangeRateDetails,
	loading,
	cryptoAsset,
	className,
	inverted,
}: ExchangeDetailsDialogProps) {
	const sourceCurrency = inverted ? "USDT" : "MYR";
	const targetCurrency = inverted ? "MYR" : "USDT";

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={className}
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
							<PlatformSection
								label="Source"
								data={exchangeRateDetails.source}
								currency={sourceCurrency}
								asset={cryptoAsset}
							/>
						</div>

						<Separator />

						<div className="grid grid-cols-2 gap-4">
							<PlatformSection
								label="Target"
								data={exchangeRateDetails.target}
								currency={targetCurrency}
								asset={cryptoAsset}
							/>
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
});

export default ExchangeDetailsDialog;

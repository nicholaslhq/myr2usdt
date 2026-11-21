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
import { Info, Pin, X } from "lucide-react";
import { ExchangeRateDetails } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React, { memo, useState, useRef, useEffect } from "react";

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
	mode?: "modal" | "docked";
	pinned?: boolean;
	onTogglePin?: () => void;
}

function formatRate(val: number | undefined | null): string {
	return val !== undefined && val !== null ? val.toFixed(4) : "N/A";
}

function PriceField({
	name,
	value,
	unit,
	animation = "",
}: {
	name: string;
	value: number | undefined | null;
	unit: string;
	animation?: "green-pulse" | "red-pulse" | "";
}) {
	return (
		<div className="col-span-1">
			<p className="text-sm font-medium">{name}:</p>
			<p className={`text-sm ${animation}`}>
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
	priceAnimation = "",
}: {
	label: string;
	data: ExchangeRateDetails["source"] | ExchangeRateDetails["target"];
	currency: string;
	asset: string;
	priceAnimation?: "green-pulse" | "red-pulse" | "";
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
			<PriceField name="Price" value={data.price} unit={currency} animation={priceAnimation} />
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

const ANIMATION_DURATION = 2000;

const ExchangeDetailsDialog = memo(function ExchangeDetailsDialog({
	exchangeRateDetails,
	loading,
	cryptoAsset,
	className,
	mode = "modal",
	pinned = false,
	onTogglePin,
}: ExchangeDetailsDialogProps) {
	const sourceCurrency = "MYR";
	const targetCurrency = "USDT";
	const [open, setOpen] = useState(false);

	// Track previous prices for animation
	const prevSourcePriceRef = useRef<number | null>(null);
	const prevTargetPriceRef = useRef<number | null>(null);
	const [sourcePriceAnimation, setSourcePriceAnimation] = useState<
		"green-pulse" | "red-pulse" | ""
	>("");
	const [targetPriceAnimation, setTargetPriceAnimation] = useState<
		"green-pulse" | "red-pulse" | ""
	>("");

	// Detect price changes and trigger animations
	useEffect(() => {
		if (loading || !exchangeRateDetails) return;

		if (prevSourcePriceRef.current !== null) {
			if (exchangeRateDetails.source.price < prevSourcePriceRef.current) {
				setSourcePriceAnimation("green-pulse");
			} else if (exchangeRateDetails.source.price > prevSourcePriceRef.current) {
				setSourcePriceAnimation("red-pulse");
			} else {
				setSourcePriceAnimation("");
			}
		}
		prevSourcePriceRef.current = exchangeRateDetails.source.price;

		if (prevTargetPriceRef.current !== null) {
			if (exchangeRateDetails.target.price < prevTargetPriceRef.current) {
				setTargetPriceAnimation("green-pulse");
			} else if (exchangeRateDetails.target.price > prevTargetPriceRef.current) {
				setTargetPriceAnimation("red-pulse");
			} else {
				setTargetPriceAnimation("");
			}
		}
		prevTargetPriceRef.current = exchangeRateDetails.target.price;
	}, [loading, exchangeRateDetails]);

	// Clear animations after duration
	useEffect(() => {
		if (!sourcePriceAnimation) return;
		const timer = setTimeout(() => setSourcePriceAnimation(""), ANIMATION_DURATION);
		return () => clearTimeout(timer);
	}, [sourcePriceAnimation]);

	useEffect(() => {
		if (!targetPriceAnimation) return;
		const timer = setTimeout(() => setTargetPriceAnimation(""), ANIMATION_DURATION);
		return () => clearTimeout(timer);
	}, [targetPriceAnimation]);

	const conditionalBody =
		loading && !exchangeRateDetails ? (
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
						priceAnimation={sourcePriceAnimation}
					/>
				</div>

				<Separator />

				<div className="grid grid-cols-2 gap-4">
					<PlatformSection
						label="Target"
						data={exchangeRateDetails.target}
						currency={targetCurrency}
						asset={cryptoAsset}
						priceAnimation={targetPriceAnimation}
					/>
				</div>
			</div>
		) : null;

	const header = (
		<DialogHeader>
			<DialogTitle>Exchange Details</DialogTitle>
			<DialogDescription>
				Detailed information about the exchange rate.
			</DialogDescription>
		</DialogHeader>
	);

	if (mode === "docked") {
		return (
			<div className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg">
				<div className="flex items-start justify-between gap-2 border-b p-4">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold leading-none">
							Exchange Details
						</h2>
						<p className="text-sm text-muted-foreground">
							Detailed information about the exchange rate.
						</p>
					</div>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onTogglePin}
							aria-label="Unpin exchange details"
							className="h-8 w-8 cursor-pointer rounded-full text-primary hover:bg-muted hover:text-foreground"
						>
							<Pin className="h-4 w-4 fill-current" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onTogglePin}
							aria-label="Close exchange details"
							className="h-8 w-8 cursor-pointer rounded-full opacity-70 hover:bg-muted hover:opacity-100"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div className="overflow-y-auto p-4 pt-0">
					{conditionalBody}
				</div>
			</div>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
				{onTogglePin && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => {
							setOpen(false);
							onTogglePin();
						}}
						aria-label={pinned ? "Unpin exchange details" : "Pin exchange details to side"}
						className={`absolute top-4 right-12 z-10 h-8 w-8 cursor-pointer rounded-full hover:bg-muted hover:text-foreground hover:opacity-100 ${
							pinned ? "text-primary opacity-100" : "opacity-70"
						}`}
					>
						<Pin
							className={`h-4 w-4 ${pinned ? "fill-current" : ""}`}
						/>
					</Button>
				)}
				{header}
				{conditionalBody}
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" className="cursor-pointer">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

export default ExchangeDetailsDialog;

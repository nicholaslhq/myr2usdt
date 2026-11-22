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
import { ExternalLink, Info, Pin } from "lucide-react";
import { ExchangeRateDetails } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
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

function formatRate(val: number | undefined | null): string {
	return val !== undefined && val !== null ? val.toFixed(4) : "N/A";
}

function formatDateTime(timestamp: number): string {
	return new Date(timestamp).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "medium",
	});
}

const ANIMATION_DURATION = 5000;

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

interface PlatformCardProps {
	label: string;
	data: ExchangeRateDetails["source"] | ExchangeRateDetails["target"];
	currency: string;
	asset: string;
	priceAnimation?: "green-pulse" | "red-pulse" | "";
}

function PlatformCard({
	label,
	data,
	currency,
	asset,
	priceAnimation = "",
}: PlatformCardProps) {
	const url = getExchangeUrl(data.platform, asset);
	const isClickable = !!url;
	const bid = data.bid ?? null;
	const ask = data.ask ?? null;
	const hasBidAsk = bid !== null && ask !== null;
	const spread = hasBidAsk ? ((ask! - bid!) / bid!) * 100 : 0;

	return (
		<section className="border rounded-lg p-4 bg-muted/50">
			<div className="flex flex-wrap items-center justify-between gap-2 mb-3">
				<div className="flex items-center gap-2">
					<h3 className="text-base font-semibold">{label}</h3>
					<Badge variant="outline" className="text-xs">
						{asset.toUpperCase()}
					</Badge>
				</div>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href={url || "#"}
								target="_blank"
								rel="noopener noreferrer"
								className={`flex items-center gap-1.5 ${
									isClickable
										? "cursor-pointer"
										: "cursor-default opacity-60"
								}`}
							>
								<Badge
									variant="secondary"
									className="flex items-center gap-1.5"
								>
									{data.platform}
									{isClickable && (
										<ExternalLink className="h-3 w-3" />
									)}
								</Badge>
							</Link>
						</TooltipTrigger>
						<TooltipContent>
							<p>Visit {data.platform} official website</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<div
				className={`text-2xl font-semibold tracking-tight ${priceAnimation}`}
			>
				{formatRate(data.price)}
				<span className="ml-1 text-sm text-muted-foreground">
					{currency}
				</span>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-4">
				{data.volume !== undefined && data.volume !== 0 && (
					<MetaField label="Volume" value={String(data.volume)} />
				)}
				{hasBidAsk && (
					<MetaField label="Spread" value={`${spread.toFixed(4)}%`} />
				)}
				{hasBidAsk && (
					<MetaField
						label="Bid"
						value={formatRate(bid!)}
						unit={currency}
					/>
				)}
				{hasBidAsk && (
					<MetaField
						label="Ask"
						value={formatRate(ask!)}
						unit={currency}
					/>
				)}
				<MetaField
					label="Last Updated"
					value={formatDateTime(data.timestamp)}
					className="col-span-2"
				/>
			</div>
		</section>
	);
}

function MetaField({
	label,
	value,
	unit,
	className,
}: {
	label: string;
	value: string;
	unit?: string;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col", className)}>
			<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<span className="text-sm font-medium">
				{value}
				{unit ? ` ${unit}` : ""}
			</span>
		</div>
	);
}

function CardSkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-10 w-1/3" />
			<Skeleton className="h-8 w-1/2" />
			<Skeleton className="h-6 w-1/4" />
			<Skeleton className="h-6 w-1/4" />
			<Skeleton className="h-6 w-1/4" />
			<Skeleton className="h-6 w-1/3" />
		</div>
	);
}

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

	const prevSourcePriceRef = useRef<number | null>(null);
	const prevTargetPriceRef = useRef<number | null>(null);
	const [sourcePriceAnimation, setSourcePriceAnimation] = useState<
		"green-pulse" | "red-pulse" | ""
	>("");
	const [targetPriceAnimation, setTargetPriceAnimation] = useState<
		"green-pulse" | "red-pulse" | ""
	>("");

	useEffect(() => {
		if (loading || !exchangeRateDetails) return;

		if (prevSourcePriceRef.current !== null) {
			if (exchangeRateDetails.source.price < prevSourcePriceRef.current) {
				setSourcePriceAnimation("green-pulse");
			} else if (
				exchangeRateDetails.source.price > prevSourcePriceRef.current
			) {
				setSourcePriceAnimation("red-pulse");
			} else {
				setSourcePriceAnimation("");
			}
		}
		prevSourcePriceRef.current = exchangeRateDetails.source.price;

		if (prevTargetPriceRef.current !== null) {
			if (exchangeRateDetails.target.price < prevTargetPriceRef.current) {
				setTargetPriceAnimation("green-pulse");
			} else if (
				exchangeRateDetails.target.price > prevTargetPriceRef.current
			) {
				setTargetPriceAnimation("red-pulse");
			} else {
				setTargetPriceAnimation("");
			}
		}
		prevTargetPriceRef.current = exchangeRateDetails.target.price;
	}, [loading, exchangeRateDetails]);

	useEffect(() => {
		if (!sourcePriceAnimation) return;
		const timer = setTimeout(
			() => setSourcePriceAnimation(""),
			ANIMATION_DURATION,
		);
		return () => clearTimeout(timer);
	}, [sourcePriceAnimation]);

	useEffect(() => {
		if (!targetPriceAnimation) return;
		const timer = setTimeout(
			() => setTargetPriceAnimation(""),
			ANIMATION_DURATION,
		);
		return () => clearTimeout(timer);
	}, [targetPriceAnimation]);

	const renderBody = (stacked = false) => {
		if (loading && !exchangeRateDetails) {
			return (
				<div className="grid gap-4 py-4">
					<CardSkeleton />
					<Separator />
					<CardSkeleton />
				</div>
			);
		}
		if (!exchangeRateDetails) return null;

		return (
			<div
				className={`grid gap-4 ${stacked ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
			>
				<PlatformCard
					label="Source"
					data={exchangeRateDetails.source}
					currency={sourceCurrency}
					asset={cryptoAsset}
					priceAnimation={sourcePriceAnimation}
				/>
				<PlatformCard
					label="Target"
					data={exchangeRateDetails.target}
					currency={targetCurrency}
					asset={cryptoAsset}
					priceAnimation={targetPriceAnimation}
				/>
			</div>
		);
	};

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
					</div>
				</div>
				<div className="overflow-y-auto p-4">{renderBody(true)}</div>
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
			<DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
				{onTogglePin && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => {
							setOpen(false);
							onTogglePin();
						}}
						aria-label={
							pinned
								? "Unpin exchange details"
								: "Pin exchange details to side"
						}
						className={`absolute top-4 right-12 z-10 h-8 w-8 cursor-pointer rounded-full hover:bg-muted hover:text-foreground hover:opacity-100 ${
							pinned ? "text-primary opacity-100" : "opacity-70"
						}`}
					>
						<Pin
							className={`h-4 w-4 ${pinned ? "fill-current" : ""}`}
						/>
					</Button>
				)}
				<DialogHeader>
					<DialogTitle>Exchange Details</DialogTitle>
					<DialogDescription>
						Detailed information about the exchange rate.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">{renderBody()}</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" className="cursor-pointer">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

export default ExchangeDetailsDialog;

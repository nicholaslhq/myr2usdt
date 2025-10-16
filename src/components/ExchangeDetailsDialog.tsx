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
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ExchangeRateDetails } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
								<Badge variant="secondary">
									{exchangeRateDetails.source.platform}
								</Badge>
								<Badge variant="secondary">
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
								<Badge variant="secondary">
									{exchangeRateDetails.target.platform}
								</Badge>
								<Badge variant="secondary">
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

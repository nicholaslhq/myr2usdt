import { CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BnmExchangeRate } from "@/app/api/bnm/usdmyr/route";
import React, { memo } from "react";

interface ExternalRatesBadgesProps {
	coinGeckoRate: number | null;
	coinGeckoDiff: number | null;
	coinbaseRate: number | null;
	coinbaseDiff: number | null;
	bnmRate: BnmExchangeRate | null;
	bnmDiff: number | null;
	loading: boolean;
}

// Pre-lookup frequently used values to avoid repeated optional chaining
const formatRate = (val: number) => val.toFixed(4);
const formatDiff = (val: number) => val.toFixed(2);

const ExternalRatesBadges = memo(function ExternalRatesBadges({
	coinGeckoRate,
	coinGeckoDiff,
	coinbaseRate,
	coinbaseDiff,
	bnmRate,
	bnmDiff,
	loading,
}: ExternalRatesBadgesProps) {
	const bnmMiddleRate = bnmRate?.rate.middle_rate;

	return (
		<CardContent className="mt-4 flex flex-wrap justify-center gap-2">
			{coinGeckoRate ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<a
							href="https://www.coingecko.com/en/coins/tether/myr"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Badge variant="secondary" className="text-sm">
								<Avatar className="size-6">
									<AvatarImage
										src="/images/coingecko-logo.webp"
										alt="CoinGecko"
									/>
									<AvatarFallback>CG</AvatarFallback>
								</Avatar>
								<span className="text-sm font-medium">
									{formatRate(coinGeckoRate)}
								</span>
								{coinGeckoDiff !== null && (
									<span
										className={`text-xs ${
											coinGeckoDiff >= 0
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										({formatDiff(coinGeckoDiff)}%)
									</span>
								)}
							</Badge>
						</a>
					</TooltipTrigger>
					<TooltipContent>
						<p>CoinGecko USDT/MYR price</p>
					</TooltipContent>
				</Tooltip>
			) : loading ? (
				<Skeleton className="h-8 w-24" />
			) : null}
			{coinbaseRate ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<a
							href="https://www.coinbase.com/converter/usdt/myr"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Badge variant="secondary" className="text-sm">
								<Avatar className="size-6">
									<AvatarImage
										src="/images/coinbase-logo.webp"
										alt="Coinbase"
									/>
									<AvatarFallback>CB</AvatarFallback>
								</Avatar>
								<span className="text-sm font-medium">
									{formatRate(coinbaseRate)}
								</span>
								{coinbaseDiff !== null && (
									<span
										className={`text-xs ${
											coinbaseDiff >= 0
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										({formatDiff(coinbaseDiff)}%)
									</span>
								)}
							</Badge>
						</a>
					</TooltipTrigger>
					<TooltipContent>
						<p>Coinbase USDT/MYR price</p>
					</TooltipContent>
				</Tooltip>
			) : loading ? (
				<Skeleton className="h-8 w-24" />
			) : null}
			{bnmMiddleRate !== null && bnmMiddleRate !== undefined ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<a
							href="https://www.bnm.gov.my/exchange-rates#:~:text=USD"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Badge variant="secondary" className="text-sm">
								<Avatar className="size-6">
									<AvatarImage
										src="/images/bnm-logo.webp"
										alt="BNM"
									/>
									<AvatarFallback>BNM</AvatarFallback>
								</Avatar>
								<span className="text-sm font-medium">
									{formatRate(bnmMiddleRate)}
								</span>
								{bnmDiff !== null && (
									<span
										className={`text-xs ${
											bnmDiff >= 0
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										({formatDiff(bnmDiff)}%)
									</span>
								)}
							</Badge>
						</a>
					</TooltipTrigger>
					<TooltipContent>
						<p>Bank Negara Malaysia USD/MYR middle rate</p>
					</TooltipContent>
				</Tooltip>
			) : loading ? (
				<Skeleton className="h-8 w-24" />
			) : null}
		</CardContent>
	);
});

export default ExternalRatesBadges;

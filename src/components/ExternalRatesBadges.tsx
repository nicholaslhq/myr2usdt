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

interface ExternalRatesBadgesProps {
	coinGeckoRate: number | null;
	coinGeckoDiff: number | null;
	coinbaseRate: number | null;
	coinbaseDiff: number | null;
	bnmRate: BnmExchangeRate | null;
	bnmDiff: number | null;
}

export default function ExternalRatesBadges({
	coinGeckoRate,
	coinGeckoDiff,
	coinbaseRate,
	coinbaseDiff,
	bnmRate,
	bnmDiff,
}: ExternalRatesBadgesProps) {
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
									{coinGeckoRate.toFixed(4)}
								</span>
								{coinGeckoDiff !== null && (
									<span
										className={`text-xs ${
											coinGeckoDiff >= 0
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										({coinGeckoDiff.toFixed(2)}%)
									</span>
								)}
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
							<Badge variant="secondary" className="text-sm">
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
								{coinbaseDiff !== null && (
									<span
										className={`text-xs ${
											coinbaseDiff >= 0
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										({coinbaseDiff.toFixed(2)}%)
									</span>
								)}
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
							<Badge variant="secondary" className="text-sm">
								<Avatar className="size-6">
									<AvatarImage
										src="/images/bnm-logo.webp"
										alt="BNM"
									/>
									<AvatarFallback>BNM</AvatarFallback>
								</Avatar>
								<span className="text-sm font-medium">
									{bnmRate.rate.middle_rate.toFixed(4)}
								</span>
								{bnmDiff !== null && (
									<span
										className={`text-xs ${
											bnmDiff >= 0
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										({bnmDiff.toFixed(2)}%)
									</span>
								)}
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
	);
}

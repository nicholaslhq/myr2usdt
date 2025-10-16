import NumberFlow from "@number-flow/react";
import { CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ExchangeRateDetails } from "@/lib/api";

interface ExchangeRateDisplayProps {
	exchangeRateDetails: ExchangeRateDetails | null;
	loading: boolean;
	hasError: boolean;
}

export default function ExchangeRateDisplay({
	exchangeRateDetails,
	loading,
	hasError,
}: ExchangeRateDisplayProps) {
	return (
		<>
			{exchangeRateDetails ? (
				<CardContent>
					<div className="text-center">
						<Tooltip>
							<TooltipTrigger asChild>
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
									} ${
										hasError
											? "text-red-600 opacity-50"
											: ""
									}`}
								/>
							</TooltipTrigger>
							{hasError && (
								<TooltipContent sideOffset={-30}>
									<p>Error fetching exchange rate</p>
								</TooltipContent>
							)}
						</Tooltip>
					</div>
				</CardContent>
			) : (
				<CardContent>
					<div className="flex items-baseline justify-center gap-2 my-6">
						<Skeleton className="h-24 w-16" />
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-24 w-50" />
					</div>
				</CardContent>
			)}
		</>
	);
}

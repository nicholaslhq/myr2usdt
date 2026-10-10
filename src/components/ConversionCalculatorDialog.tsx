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
import { Calculator } from "lucide-react";
import { ExchangeRateDetails } from "@/lib/api";
import React, { memo, useState } from "react";

interface ConversionCalculatorDialogProps {
	exchangeRateDetails: ExchangeRateDetails | null;
	loading: boolean;
	className?: string;
	inverted: boolean;
}

function formatCurrency(val: number, decimals = 2): string {
	return val.toFixed(decimals);
}

function formatRate(val: number | undefined | null): string {
	return val !== undefined && val !== null ? val.toFixed(4) : "N/A";
}

const ConversionCalculatorDialog = memo(function ConversionCalculatorDialog({
	exchangeRateDetails,
	loading,
	className,
	inverted,
}: ConversionCalculatorDialogProps) {
	const [inputValue, setInputValue] = useState("");
	const [inputCurrency, setInputCurrency] = useState<"source" | "target">("source");

	const rate = exchangeRateDetails?.rate;
	const sourceCurrency = inverted ? "USDT" : "MYR";
	const targetCurrency = inverted ? "MYR" : "USDT";
	// Rate from API is MYR per USDT (1 USDT = rate MYR)
	// Always use base rate for conversions
	const baseRate = rate;

	const handleInputChange = (value: string) => {
		const numericValue = value.replace(/[^0-9.]/g, "");
		const parts = numericValue.split(".");
		if (parts.length > 2) {
			setInputValue(parts[0] + "." + parts.slice(1).join(""));
		} else {
			setInputValue(numericValue);
		}
	};

	const sourceAmount = inputValue ? parseFloat(inputValue) : 0;

	// baseRate = MYR per USDT (1 USDT = baseRate MYR)
	// MYR → USDT = MYR / baseRate
	// USDT → MYR = USDT * baseRate
	const myrAmount = baseRate
		? inputCurrency === "source" && !inverted ? sourceAmount
		: inputCurrency === "target" && inverted ? sourceAmount
		: inputCurrency === "source" && inverted ? sourceAmount * baseRate
		: inputCurrency === "target" && !inverted ? sourceAmount / baseRate
		: 0
		: 0;

	const usdtAmount = baseRate
		? inputCurrency === "target" && !inverted ? sourceAmount
		: inputCurrency === "source" && inverted ? sourceAmount
		: inputCurrency === "target" && inverted ? sourceAmount / baseRate
		: inputCurrency === "source" && !inverted ? sourceAmount * baseRate
		: 0
		: 0;

	const displaySourceAmount = inverted ? usdtAmount : myrAmount;
	const displayTargetAmount = inverted ? myrAmount : usdtAmount;

	const inputClassName =
		"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={className}
					disabled={!exchangeRateDetails || loading}
					aria-label="Conversion Calculator"
				>
					<Calculator className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Conversion Calculator</DialogTitle>
					<DialogDescription>
						Calculate converted amounts using the current exchange rate.
					</DialogDescription>
				</DialogHeader>
				{loading && !exchangeRateDetails ? (
					<div className="grid gap-4 py-4">
						<div className="h-12 w-3/4 animate-pulse bg-muted" />
						<div className="h-10 w-full animate-pulse bg-muted" />
						<div className="h-10 w-full animate-pulse bg-muted" />
					</div>
				) : exchangeRateDetails ? (
					<div className="grid gap-4 py-4">
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<label
									htmlFor="source-amount"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{sourceCurrency} Amount
								</label>
								<label
									htmlFor="target-amount"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{targetCurrency} Amount
								</label>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<input
									id="source-amount"
									type="number"
									step="0.01"
									min="0"
									value={
										inputCurrency === "source"
											? inputValue
											: formatCurrency(displaySourceAmount)
									}
									onChange={(e) => {
										setInputCurrency("source");
										handleInputChange(e.target.value);
									}}
									placeholder="0.00"
									disabled={!baseRate}
									className={inputClassName}
								/>
								<input
									id="target-amount"
									type="number"
									step="0.01"
									min="0"
									value={
										inputCurrency === "target"
											? inputValue
											: formatCurrency(displayTargetAmount)
									}
									onChange={(e) => {
										setInputCurrency("target");
										handleInputChange(e.target.value);
									}}
									placeholder="0.00"
									disabled={!baseRate}
									className={inputClassName}
								/>
							</div>
						</div>

						<div className="pt-2 border-t">
							<p className="text-sm text-muted-foreground text-center">
								{inverted
									? `Rate: 1 MYR = ${formatRate(baseRate ? 1 / baseRate : 0)} USDT`
									: `Rate: 1 USDT = ${formatRate(baseRate)} MYR`}
							</p>
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

export default ConversionCalculatorDialog;
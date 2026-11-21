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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Calculator,
	ArrowLeftRight,
	ChevronDown,
	ChevronRight,
	RotateCcw,
	Pin,
} from "lucide-react";
import { ExchangeRateDetails } from "@/lib/api";
import React, { memo, useState, useMemo, useEffect, useCallback } from "react";

interface ConversionCalculatorDialogProps {
	exchangeRateDetails: ExchangeRateDetails | null;
	loading: boolean;
	className?: string;
	inverted: boolean;
	onToggleInversion?: () => void;
	mode?: "modal" | "docked";
	pinned?: boolean;
	onTogglePin?: () => void;
}

type FeeType = "fixed" | "percentage";
type FeePayer = "source" | "target";

interface FeeConfig {
	id: string;
	name: string;
	enabled: boolean;
	type: FeeType;
	value: number;
	payer: FeePayer;
	description?: string;
	estimated?: boolean;
	formula?: string;
}

const DEFAULT_FEES: FeeConfig[] = [
	{
		id: "deposit_fee",
		name: "Deposit Fee",
		enabled: false,
		type: "fixed",
		value: 0,
		payer: "source",
		description: "Fee to deposit funds",
		estimated: true,
	},
	{
		id: "buying_fee",
		name: "Buying Fee",
		enabled: false,
		type: "percentage",
		value: 0.1,
		payer: "source",
		description: "Platform trading fee when buying",
		formula: "amount * percentage / 100",
		estimated: true,
	},
	{
		id: "sending_fee",
		name: "Sending/Transfer Fee",
		enabled: false,
		type: "fixed",
		value: 0,
		payer: "source",
		description: "Fee to send/transfer crypto",
		estimated: true,
	},
	{
		id: "selling_fee",
		name: "Selling Fee",
		enabled: false,
		type: "percentage",
		value: 0.1,
		payer: "target",
		description: "Platform trading fee when selling",
		formula: "amount * percentage / 100",
		estimated: true,
	},
	{
		id: "withdrawal_fee",
		name: "Withdrawal Fee",
		enabled: false,
		type: "fixed",
		value: 5,
		payer: "target",
		description: "Fee to withdraw funds",
		estimated: true,
	},
];

function formatCurrency(val: number, decimals = 2): string {
	if (isNaN(val) || !isFinite(val)) return "0.00";
	return val.toFixed(decimals);
}

function formatRate(val: number | undefined | null): string {
	return val !== undefined && val !== null && !isNaN(val)
		? val.toFixed(4)
		: "N/A";
}

function safeParseFloat(val: string): number {
	if (val === "" || val === ".") return 0;
	const parsed = parseFloat(val);
	return isNaN(parsed) ? 0 : parsed;
}

const ConversionCalculatorDialog = memo(function ConversionCalculatorDialog({
	exchangeRateDetails,
	loading,
	className,
	inverted,
	onToggleInversion,
	mode = "modal",
	pinned = false,
	onTogglePin,
}: ConversionCalculatorDialogProps) {
	const [inputValue, setInputValue] = useState("1000");
	const [inputCurrency, setInputCurrency] = useState<"source" | "target">(
		"source",
	);
	const [feesEnabled, setFeesEnabled] = useState(false);
	const [feesExpanded, setFeesExpanded] = useState(false);
	const [fees, setFees] = useState<FeeConfig[]>(
		DEFAULT_FEES.map((f) => ({ ...f })),
	);
	const [dialogOpen, setDialogOpen] = useState(false);

	const rate = exchangeRateDetails?.rate;
	const sourceCurrency = inverted ? "USDT" : "MYR";
	const targetCurrency = inverted ? "MYR" : "USDT";
	const baseRate = rate;

	const handleSwapDirection = useCallback(() => {
		setInputCurrency((prev) => (prev === "source" ? "target" : "source"));
		onToggleInversion?.();
	}, [onToggleInversion]);

	const arrowSwapStyle = useMemo(
		() => ({
			transform:
				inputCurrency === "target" ? "rotate(180deg)" : "rotate(0deg)",
			transition: "transform 0.3s ease",
		}),
		[inputCurrency],
	);

	useEffect(() => {
		if (dialogOpen && !inverted) {
			setInputCurrency("source");
			if (inputValue === "" || inputValue === "0") {
				setInputValue("1000");
			}
		} else if (dialogOpen && inverted) {
			setInputCurrency("target");
			if (inputValue === "" || inputValue === "0") {
				setInputValue("1000");
			}
		}
	}, [dialogOpen, inverted]);

	useEffect(() => {
		if (mode === "docked") {
			setInputCurrency(inverted ? "target" : "source");
		}
	}, [mode, inverted]);

	const handleInputChange = (value: string) => {
		const numericValue = value.replace(/[^0-9.]/g, "");
		const parts = numericValue.split(".");
		if (parts.length > 2) {
			setInputValue(parts[0] + "." + parts.slice(1).join(""));
		} else {
			setInputValue(numericValue);
		}
	};

	const sourceAmountInput = inputValue ? safeParseFloat(inputValue) : 0;

	const isInputMyr =
		(inputCurrency === "source" && !inverted) ||
		(inputCurrency === "target" && inverted);
	const isInputUsdt =
		(inputCurrency === "target" && !inverted) ||
		(inputCurrency === "source" && inverted);

	const grossMyrAmount = baseRate
		? isInputMyr
			? sourceAmountInput
			: isInputUsdt
				? sourceAmountInput * baseRate
				: 0
		: 0;

	const grossUsdtAmount = baseRate
		? isInputUsdt
			? sourceAmountInput
			: isInputMyr
				? sourceAmountInput / baseRate
				: 0
		: 0;

	const feeCalculation = useMemo(() => {
		if (!feesEnabled || !baseRate || sourceAmountInput <= 0) {
			return {
				myrAfterFees: grossMyrAmount,
				usdtAfterFees: grossUsdtAmount,
				totalFeesMyr: 0,
				totalFeesUsdt: 0,
				sourceMyrAfterSourceFees: grossMyrAmount,
				sourceUsdtAfterSourceFees: grossUsdtAmount,
			};
		}

		let currentMyr = grossMyrAmount;
		let currentUsdt = grossUsdtAmount;

		// Apply deposit fee first on original amount
		const depositFee = fees.find(
			(f) => f.id === "deposit_fee" && f.enabled,
		);
		if (depositFee) {
			const before = isInputMyr ? currentMyr : currentUsdt;
			let feeAmount =
				depositFee.type === "fixed"
					? depositFee.value
					: (before * depositFee.value) / 100;
			if (feeAmount > before && before > 0) feeAmount = before * 0.99;
			if (feeAmount < 0) feeAmount = 0;
			if (isInputMyr) {
				currentMyr = Math.max(0, currentMyr - feeAmount);
			} else {
				currentUsdt = Math.max(0, currentUsdt - feeAmount);
			}
		}

		// Apply buying fee on remaining amount
		const buyingFee = fees.find((f) => f.id === "buying_fee" && f.enabled);
		if (buyingFee) {
			const before = isInputMyr ? currentMyr : currentUsdt;
			let feeAmount =
				buyingFee.type === "fixed"
					? buyingFee.value
					: (before * buyingFee.value) / 100;
			if (feeAmount > before && before > 0) feeAmount = before * 0.99;
			if (feeAmount < 0) feeAmount = 0;
			if (isInputMyr) {
				currentMyr = Math.max(0, currentMyr - feeAmount);
			} else {
				currentUsdt = Math.max(0, currentUsdt - feeAmount);
			}
		}

		const sourceMyrAfterSourceFees = isInputMyr
			? currentMyr
			: currentUsdt * baseRate;
		const sourceUsdtAfterSourceFees = isInputUsdt
			? currentUsdt
			: currentMyr / baseRate;

		// Convert
		let convertedMyr = isInputMyr ? currentMyr : currentUsdt * baseRate;
		let convertedUsdt = isInputUsdt ? currentUsdt : currentMyr / baseRate;

		// Apply sending/transfer fee in the middle
		const sendingFee = fees.find(
			(f) => f.id === "sending_fee" && f.enabled,
		);
		if (sendingFee) {
			const before = isInputMyr ? convertedUsdt : convertedMyr;
			let feeAmount =
				sendingFee.type === "fixed"
					? sendingFee.value
					: (before * sendingFee.value) / 100;
			if (feeAmount > before && before > 0) feeAmount = before * 0.99;
			if (feeAmount < 0) feeAmount = 0;
			if (isInputMyr) {
				convertedUsdt = Math.max(0, convertedUsdt - feeAmount);
			} else {
				convertedMyr = Math.max(0, convertedMyr - feeAmount);
			}
		}

		let finalMyr = convertedMyr;
		let finalUsdt = convertedUsdt;

		// Apply selling fee
		const sellingFee = fees.find(
			(f) => f.id === "selling_fee" && f.enabled,
		);
		if (sellingFee) {
			const before = isInputMyr ? finalUsdt : finalMyr;
			let feeAmount =
				sellingFee.type === "fixed"
					? sellingFee.value
					: (before * sellingFee.value) / 100;
			if (feeAmount > before && before > 0) feeAmount = before * 0.99;
			if (feeAmount < 0) feeAmount = 0;
			if (isInputMyr) {
				finalUsdt = Math.max(0, finalUsdt - feeAmount);
			} else {
				finalMyr = Math.max(0, finalMyr - feeAmount);
			}
		}

		// Apply withdrawal fee
		const withdrawalFee = fees.find(
			(f) => f.id === "withdrawal_fee" && f.enabled,
		);
		if (withdrawalFee) {
			const before = isInputMyr ? finalUsdt : finalMyr;
			let feeAmount =
				withdrawalFee.type === "fixed"
					? withdrawalFee.value
					: (before * withdrawalFee.value) / 100;
			if (feeAmount > before && before > 0) feeAmount = before * 0.99;
			if (feeAmount < 0) feeAmount = 0;
			if (isInputMyr) {
				finalUsdt = Math.max(0, finalUsdt - feeAmount);
			} else {
				finalMyr = Math.max(0, finalMyr - feeAmount);
			}
		}

		const totalFeesMyr = grossMyrAmount - finalUsdt * baseRate;
		const totalFeesUsdt = grossUsdtAmount - finalUsdt;

		return {
			myrAfterFees: finalMyr,
			usdtAfterFees: finalUsdt,
			totalFeesMyr: Math.max(0, totalFeesMyr),
			totalFeesUsdt: Math.max(0, totalFeesUsdt),
			sourceMyrAfterSourceFees,
			sourceUsdtAfterSourceFees,
			convertedUsdtAfterSending: isInputMyr
				? convertedUsdt
				: convertedMyr / baseRate,
		};
	}, [
		feesEnabled,
		baseRate,
		grossMyrAmount,
		grossUsdtAmount,
		fees,
		isInputMyr,
		isInputUsdt,
		sourceAmountInput,
	]);

	const displaySourceAmount = inverted
		? feeCalculation.usdtAfterFees
		: feeCalculation.myrAfterFees;
	const displayTargetAmount = inverted
		? feeCalculation.myrAfterFees
		: feeCalculation.usdtAfterFees;

	const grossDisplaySource = inverted ? grossUsdtAmount : grossMyrAmount;
	const grossDisplayTarget = inverted ? grossMyrAmount : grossUsdtAmount;

	const updateFee = (id: string, updates: Partial<FeeConfig>) => {
		setFees((prev) =>
			prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
		);
	};

	const resetFees = () => {
		setFees(DEFAULT_FEES.map((f) => ({ ...f })));
	};

	const hasEstimatedFees = fees.some((f) => f.enabled && f.estimated);
	const totalFeesAmount = isInputMyr
		? feeCalculation.totalFeesMyr
		: feeCalculation.totalFeesUsdt;
	const totalFeesPercent =
		sourceAmountInput > 0 ? (totalFeesAmount / sourceAmountInput) * 100 : 0;

	// Calculate breakdown values
	const depositFeeVal = (() => {
		const fee = fees.find((f) => f.id === "deposit_fee" && f.enabled);
		if (!fee) return 0;
		const amt = isInputMyr ? grossMyrAmount : grossUsdtAmount;
		let fa = fee.type === "fixed" ? fee.value : (amt * fee.value) / 100;
		if (fa > amt && amt > 0) fa = amt * 0.99;
		if (fa < 0) fa = 0;
		return fa;
	})();

	const afterDeposit = Math.max(
		0,
		(isInputMyr ? grossMyrAmount : grossUsdtAmount) - depositFeeVal,
	);

	const buyingFeeVal = (() => {
		const fee = fees.find((f) => f.id === "buying_fee" && f.enabled);
		if (!fee) return 0;
		let fa =
			fee.type === "fixed" ? fee.value : (afterDeposit * fee.value) / 100;
		if (fa > afterDeposit && afterDeposit > 0) fa = afterDeposit * 0.99;
		if (fa < 0) fa = 0;
		return fa;
	})();

	const netAfterSource = Math.max(0, afterDeposit - buyingFeeVal);

	const sendingFeeVal = (() => {
		const fee = fees.find((f) => f.id === "sending_fee" && f.enabled);
		if (!fee || !baseRate) return 0;
		const amtInTarget = isInputMyr
			? netAfterSource / baseRate
			: netAfterSource * baseRate;
		let fa =
			fee.type === "fixed" ? fee.value : (amtInTarget * fee.value) / 100;
		if (fa > amtInTarget && amtInTarget > 0) fa = amtInTarget * 0.99;
		if (fa < 0) fa = 0;
		return fa;
	})();

	let amtAtTarget = isInputMyr
		? netAfterSource / (baseRate || 1)
		: netAfterSource * (baseRate || 1);
	amtAtTarget = Math.max(0, amtAtTarget - sendingFeeVal);

	const sellingFeeVal = (() => {
		const fee = fees.find((f) => f.id === "selling_fee" && f.enabled);
		if (!fee) return 0;
		let fa =
			fee.type === "fixed" ? fee.value : (amtAtTarget * fee.value) / 100;
		if (fa > amtAtTarget && amtAtTarget > 0) fa = amtAtTarget * 0.99;
		if (fa < 0) fa = 0;
		return fa;
	})();

	const amtAfterSelling = Math.max(0, amtAtTarget - sellingFeeVal);

	const withdrawalFeeVal = (() => {
		const fee = fees.find((f) => f.id === "withdrawal_fee" && f.enabled);
		if (!fee) return 0;
		let fa =
			fee.type === "fixed"
				? fee.value
				: (amtAfterSelling * fee.value) / 100;
		if (fa > amtAfterSelling && amtAfterSelling > 0)
			fa = amtAfterSelling * 0.99;
		if (fa < 0) fa = 0;
		return fa;
	})();

	const conditionalBody =
		loading && !exchangeRateDetails ? (
					<div className="grid gap-4 py-4">
						<div className="h-12 w-3/4 animate-pulse bg-muted" />
						<div className="h-10 w-full animate-pulse bg-muted" />
						<div className="h-10 w-full animate-pulse bg-muted" />
					</div>
				) : exchangeRateDetails ? (
					<div className="grid gap-4 py-4">
						<div className="space-y-4">
							<div className="grid grid-cols-[1fr_auto_1fr] gap-4">
								<label
									htmlFor="source-amount"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-center"
								>
									{sourceCurrency}
								</label>
								<div className="w-5" aria-hidden="true" />
								<label
									htmlFor="target-amount"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-center"
								>
									{targetCurrency}
								</label>
							</div>
							<div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
								<Input
									id="source-amount"
									type="number"
									step="1"
									min="0"
									value={
										inputCurrency === "source"
											? inputValue
											: formatCurrency(
													displaySourceAmount,
												)
									}
									onChange={(e) => {
										setInputCurrency("source");
										handleInputChange(e.target.value);
									}}
									placeholder="0.00"
									disabled={!baseRate}
								/>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 cursor-pointer rounded-full hover:bg-gray-200"
									onClick={handleSwapDirection}
									aria-label="Swap conversion direction"
									disabled={!baseRate}
								>
									<ArrowLeftRight
										className="h-5 w-5 text-muted-foreground"
										style={arrowSwapStyle}
										aria-hidden="true"
									/>
								</Button>
								<Input
									id="target-amount"
									type="number"
									step="1"
									min="0"
									value={
										inputCurrency === "target"
											? inputValue
											: formatCurrency(
													displayTargetAmount,
												)
									}
									onChange={(e) => {
										setInputCurrency("target");
										handleInputChange(e.target.value);
									}}
									placeholder="0.00"
									disabled={!baseRate}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
							<div className="flex-1 space-y-1">
								<Label
									htmlFor="fees-toggle"
									className="text-sm font-medium"
								>
									Include Fees
								</Label>
								<p className="text-xs text-muted-foreground">
									Enable fee calculations
								</p>
							</div>
							<Switch
								id="fees-toggle"
								checked={feesEnabled}
								onCheckedChange={setFeesEnabled}
								disabled={!baseRate}
							/>
						</div>

						{feesEnabled && baseRate && (
							<div className="space-y-3">
								{hasEstimatedFees && (
									<div className="text-xs text-muted-foreground p-2 rounded bg-muted/50">
										* Some fees are estimated/default values
									</div>
								)}

								<Collapsible
									open={feesExpanded}
									onOpenChange={setFeesExpanded}
								>
									<div className="flex items-center justify-between">
										<CollapsibleTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="p-0 h-auto"
											>
												{feesExpanded ? (
													<ChevronDown className="h-4 w-4 mr-1" />
												) : (
													<ChevronRight className="h-4 w-4 mr-1" />
												)}
												<span className="text-sm font-medium">
													Fee Configuration
												</span>
											</Button>
										</CollapsibleTrigger>
										<Button
											variant="ghost"
											size="sm"
											onClick={resetFees}
											className="h-7 text-xs"
										>
											<RotateCcw className="h-3 w-3 mr-1" />
											Reset
										</Button>
									</div>

									<CollapsibleContent className="space-y-2 mt-2">
										{[
											"deposit_fee",
											"buying_fee",
											"sending_fee",
											"selling_fee",
											"withdrawal_fee",
										].map((feeId) => {
											const fee = fees.find(
												(f) => f.id === feeId,
											);
											if (!fee) return null;
											return (
												<div
													key={fee.id}
													className="p-2 border rounded space-y-2"
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-2 flex-1">
															<Switch
																checked={
																	fee.enabled
																}
																onCheckedChange={(
																	checked,
																) =>
																	updateFee(
																		fee.id,
																		{
																			enabled:
																				checked,
																		},
																	)
																}
																className="scale-75"
															/>
															<Label className="text-xs font-medium flex-1">
																{fee.name}
																{fee.estimated && (
																	<span className="text-muted-foreground ml-1">
																		*
																	</span>
																)}
															</Label>
														</div>
														<span className="text-xs text-muted-foreground">
															{fee.payer ===
															"source"
																? `Deduct from ${sourceCurrency}`
																: `Deduct from ${targetCurrency}`}
														</span>
													</div>
													{fee.enabled && (
														<div className="grid grid-cols-3 gap-2">
															<div className="col-span-1">
																<select
																	value={
																		fee.type
																	}
																	onChange={(
																		e,
																	) =>
																		updateFee(
																			fee.id,
																			{
																				type: e
																					.target
																					.value as FeeType,
																			},
																		)
																	}
																	className="flex h-7 w-full rounded-md border border-input bg-background px-1 py-0.5 text-xs"
																>
																	<option value="fixed">
																		Fixed
																	</option>
																	<option value="percentage">
																		%
																	</option>
																</select>
															</div>
															<div className="col-span-2">
																<Input
																	type="number"
																	step={
																		fee.type ===
																		"percentage"
																			? "0.01"
																			: "0.01"
																	}
																	min="0"
																	value={
																		fee.value
																	}
																	onChange={(
																		e,
																	) => {
																		const val =
																			safeParseFloat(
																				e
																					.target
																					.value,
																			);
																		if (
																			val >=
																			0
																		) {
																			updateFee(
																				fee.id,
																				{
																					value: val,
																				},
																			);
																		}
																	}}
																	className="h-7 text-xs"
																/>
															</div>
														</div>
													)}
												</div>
											);
										})}
									</CollapsibleContent>
								</Collapsible>

								<div className="p-4 border rounded-lg space-y-3 bg-muted/20">
									<h4 className="text-base font-semibold tracking-tight">
										Transaction Breakdown
									</h4>
									<div className="space-y-4 text-sm">
										<div className="space-y-1.5">
											<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
												Source Platform
											</div>
											<div className="pl-2 space-y-1">
												<div className="flex justify-between">
													<span>Initial Amount</span>
													<span className="font-medium">
														{formatCurrency(
															isInputMyr
																? sourceAmountInput
																: sourceAmountInput *
																		baseRate,
														)}{" "}
														{sourceCurrency}
													</span>
												</div>
												{feesEnabled &&
													depositFeeVal > 0 && (
														<div className="flex justify-between text-muted-foreground">
															<span>
																− Deposit Fee
															</span>
															<span>
																-
																{formatCurrency(
																	depositFeeVal,
																)}{" "}
																{sourceCurrency}
															</span>
														</div>
													)}
												{feesEnabled &&
													depositFeeVal > 0 && (
														<div className="flex justify-between text-muted-foreground text-xs italic">
															<span>
																After deposit
																fee
															</span>
															<span>
																{formatCurrency(
																	afterDeposit,
																)}{" "}
																{sourceCurrency}
															</span>
														</div>
													)}
												{feesEnabled &&
													buyingFeeVal > 0 && (
														<div className="flex justify-between text-muted-foreground">
															<span>
																− Buying Fee (on
																remaining)
															</span>
															<span>
																-
																{formatCurrency(
																	buyingFeeVal,
																)}{" "}
																{sourceCurrency}
															</span>
														</div>
													)}
												<div className="flex justify-between font-semibold border-t pt-1.5 mt-1">
													<span>
														Net Available for
														Transfer
													</span>
													<span>
														{formatCurrency(
															netAfterSource,
														)}{" "}
														{sourceCurrency}
													</span>
												</div>
											</div>
										</div>

										<div className="space-y-1.5">
											<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
												Transfer
											</div>
											<div className="pl-2 space-y-1">
												<div className="flex justify-between">
													<span>Net Amount</span>
													<span className="font-medium">
														{formatCurrency(
															netAfterSource,
														)}{" "}
														{sourceCurrency}
													</span>
												</div>
												{feesEnabled &&
													sendingFeeVal > 0 && (
														<div className="flex justify-between text-muted-foreground">
															<span>
																−
																Sending/Transfer
																Fee
															</span>
															<span>
																-
																{formatCurrency(
																	sendingFeeVal,
																)}{" "}
																{targetCurrency}
															</span>
														</div>
													)}
												<div className="flex justify-between font-medium">
													<span>
														Amount Sent to Target
													</span>
													<span>
														{formatCurrency(
															amtAtTarget,
														)}{" "}
														{targetCurrency}
													</span>
												</div>
											</div>
										</div>

										<div className="space-y-1.5">
											<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
												Target Platform
											</div>
											<div className="pl-2 space-y-1">
												<div className="flex justify-between">
													<span>Amount Received</span>
													<span className="font-medium">
														{formatCurrency(
															amtAtTarget,
														)}{" "}
														{targetCurrency}
													</span>
												</div>
												{feesEnabled &&
													sellingFeeVal > 0 && (
														<div className="flex justify-between text-muted-foreground">
															<span>
																− Selling Fee
															</span>
															<span>
																-
																{formatCurrency(
																	sellingFeeVal,
																)}{" "}
																{targetCurrency}
															</span>
														</div>
													)}
												{feesEnabled &&
													withdrawalFeeVal > 0 && (
														<div className="flex justify-between text-muted-foreground">
															<span>
																− Withdrawal Fee
															</span>
															<span>
																-
																{formatCurrency(
																	withdrawalFeeVal,
																)}{" "}
																{targetCurrency}
															</span>
														</div>
													)}
												<div className="flex justify-between font-bold border-t pt-1.5 mt-1 text-green-600 dark:text-green-400">
													<span>
														Final Net Amount
														Received
													</span>
													<span>
														{formatCurrency(
															Math.max(
																0,
																amtAfterSelling -
																	withdrawalFeeVal,
															),
														)}{" "}
														{targetCurrency}
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="p-4 border rounded-lg space-y-3 bg-muted/20">
									<h4 className="text-base font-semibold tracking-tight">
										Conversion Summary
									</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>
												Gross Conversion (
												{sourceCurrency} →{" "}
												{targetCurrency})
											</span>
											<span className="font-medium">
												{formatCurrency(
													grossDisplaySource,
												)}{" "}
												→{" "}
												{formatCurrency(
													grossDisplayTarget,
												)}
											</span>
										</div>
										<div className="flex justify-between text-orange-600 dark:text-orange-400">
											<span>
												Total Fees (
												{totalFeesPercent.toFixed(2)}
												%)
											</span>
											<span>
												{inverted
													? `${formatCurrency(feeCalculation.totalFeesUsdt)} USDT (${formatCurrency(feeCalculation.totalFeesMyr)} MYR)`
													: `${formatCurrency(feeCalculation.totalFeesMyr)} MYR (${formatCurrency(feeCalculation.totalFeesUsdt)} USDT)`}
											</span>
										</div>
										<div className="flex justify-between border-t pt-2 font-bold text-green-600 dark:text-green-400">
											<span>
												Final Received ({targetCurrency}
												)
											</span>
											<span>
												{formatCurrency(
													feeCalculation.usdtAfterFees,
												)}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{baseRate && (
							<div className="pt-2 border-t space-y-1 text-sm text-muted-foreground">
								<p className="text-center">
									Rate (excl. fees): 1{" "}
									{inverted ? "MYR" : "USDT"} ={" "}
									{formatRate(
										inverted ? 1 / baseRate : baseRate,
									)}{" "}
									{inverted ? "USDT" : "MYR"}
								</p>
								{feesEnabled && (
									<>
										<p className="text-center">
											Rate (incl. fees): 1{" "}
											{inverted ? "MYR" : "USDT"} ={" "}
											{formatRate(
												inverted
													? feeCalculation.usdtAfterFees /
															sourceAmountInput
													: sourceAmountInput /
															feeCalculation.usdtAfterFees,
											)}{" "}
											{inverted ? "USDT" : "MYR"}
										</p>
										<p className="text-center font-medium text-foreground">
											Difference:{" "}
											{formatRate(
												Math.abs(
													(inverted
														? feeCalculation.usdtAfterFees /
															sourceAmountInput
														: sourceAmountInput /
															feeCalculation.usdtAfterFees) -
														(inverted
															? 1 / baseRate
															: baseRate),
												),
											)}{" "}
											(
											{baseRate
												? Math.abs(
														(((inverted
															? feeCalculation.usdtAfterFees /
																sourceAmountInput
															: sourceAmountInput /
																feeCalculation.usdtAfterFees) -
															(inverted
																? 1 / baseRate
																: baseRate)) /
															(inverted
																? 1 / baseRate
																: baseRate)) *
															100,
													).toFixed(2)
												: "0.00"}
											%)
										</p>
									</>
								)}
							</div>
						)}
					</div>
				) : null;

	const header = (
		<DialogHeader>
			<DialogTitle>Conversion Calculator</DialogTitle>
			<DialogDescription>
				Calculate converted amounts using the current exchange rate.
			</DialogDescription>
		</DialogHeader>
	);

	if (mode === "docked") {
		return (
			<div className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg">
				<div className="flex items-start justify-between gap-2 border-b p-4">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold leading-none">
							Conversion Calculator
						</h2>
						<p className="text-sm text-muted-foreground">
							Calculate converted amounts using the current
							exchange rate.
						</p>
					</div>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onTogglePin}
							aria-label="Unpin calculator"
							className="h-8 w-8 cursor-pointer rounded-full text-primary hover:bg-muted hover:text-foreground"
						>
							<Pin className="h-4 w-4 fill-current" />
						</Button>
					</div>
				</div>
				<div className="overflow-y-auto p-4 pt-0">{conditionalBody}</div>
			</div>
		);
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
			<DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
				{onTogglePin && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => {
							setDialogOpen(false);
							onTogglePin();
						}}
						aria-label={pinned ? "Unpin calculator" : "Pin calculator to side"}
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

export default ConversionCalculatorDialog;

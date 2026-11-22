import { CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowRight, CircleDollarSign } from "lucide-react";

const MYR_PLATFORMS = [
	{ value: "luno", label: "Luno" },
	{ value: "hata", label: "Hata" },
];

const USDT_PLATFORMS = [
	{ value: "binance", label: "Binance" },
	{ value: "huobi", label: "Huobi" },
];

interface PlatformAssetSelectorsProps {
	sourcePlatform: string;
	setSourcePlatform: (value: string) => void;
	targetPlatform: string;
	setTargetPlatform: (value: string) => void;
	cryptoAsset: string;
	setCryptoAsset: (value: string) => void;
	inverted: boolean;
}

export default function PlatformAssetSelectors({
	sourcePlatform,
	setSourcePlatform,
	targetPlatform,
	setTargetPlatform,
	cryptoAsset,
	setCryptoAsset,
	inverted,
}: PlatformAssetSelectorsProps) {
	const sourcePlatforms = inverted ? USDT_PLATFORMS : MYR_PLATFORMS;
	const targetPlatforms = inverted ? MYR_PLATFORMS : USDT_PLATFORMS;
	const sourceValue = inverted ? targetPlatform : sourcePlatform;
	const targetValue = inverted ? sourcePlatform : targetPlatform;

	const handleSourceChange = (value: string) => {
		if (inverted) {
			setTargetPlatform(value);
		} else {
			setSourcePlatform(value);
		}
	};

	const handleTargetChange = (value: string) => {
		if (inverted) {
			setSourcePlatform(value);
		} else {
			setTargetPlatform(value);
		}
	};

	return (
		<CardContent className="flex items-center justify-center gap-2">
			<Select value={sourceValue} onValueChange={handleSourceChange}>
				<SelectTrigger
					id="source-platform"
					aria-label="Select source platform"
					className="flex-1 cursor-pointer"
				>
					<SelectValue placeholder="Source" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Source</SelectLabel>
						{sourcePlatforms.map((platform) => (
							<SelectItem
								key={platform.value}
								value={platform.value}
							>
								{platform.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>

			<ArrowRight className="h-5 w-5 text-muted-foreground" />

			<Select value={targetValue} onValueChange={handleTargetChange}>
				<SelectTrigger
					id="target-platform"
					aria-label="Select target platform"
					className="flex-1 cursor-pointer"
				>
					<SelectValue placeholder="Target" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Target</SelectLabel>
						{targetPlatforms.map((platform) => (
							<SelectItem
								key={platform.value}
								value={platform.value}
							>
								{platform.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>

			<CircleDollarSign className="h-5 w-5 text-muted-foreground" />

			<Select
				value={cryptoAsset}
				onValueChange={(value) => {
					setCryptoAsset(value);
				}}
			>
				<SelectTrigger
					id="crypto-asset"
					aria-label="Select crypto asset"
					className="flex-1 cursor-pointer"
				>
					<SelectValue placeholder="Asset" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Crypto</SelectLabel>
						<SelectItem value="xrp">XRP</SelectItem>
						<SelectItem value="btc">BTC</SelectItem>
						<SelectItem value="eth">ETH</SelectItem>
						<SelectItem value="sol">SOL</SelectItem>
						<SelectItem value="xlm">XLM</SelectItem>
						<SelectItem value="ltc">LTC</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</CardContent>
	);
}

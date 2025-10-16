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

interface PlatformAssetSelectorsProps {
	sourcePlatform: string;
	setSourcePlatform: (value: string) => void;
	targetPlatform: string;
	setTargetPlatform: (value: string) => void;
	cryptoAsset: string;
	setCryptoAsset: (value: string) => void;
}

export default function PlatformAssetSelectors({
	sourcePlatform,
	setSourcePlatform,
	targetPlatform,
	setTargetPlatform,
	cryptoAsset,
	setCryptoAsset,
}: PlatformAssetSelectorsProps) {
	return (
		<CardContent className="flex items-center justify-center space-x-2">
			<Select
				value={sourcePlatform}
				onValueChange={(value) => {
					setSourcePlatform(value);
				}}
			>
				<SelectTrigger id="source-platform" className="w-[120px]">
					<SelectValue placeholder="Source" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Source</SelectLabel>
						<SelectItem value="luno">Luno</SelectItem>
						<SelectItem value="hata">Hata</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>

			<ArrowRight className="h-5 w-5 text-gray-700" />

			<Select
				value={targetPlatform}
				onValueChange={(value) => {
					setTargetPlatform(value);
				}}
			>
				<SelectTrigger id="target-platform" className="w-[120px]">
					<SelectValue placeholder="Target" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Target</SelectLabel>
						<SelectItem value="binance">Binance</SelectItem>
						<SelectItem value="huobi">Huobi</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>

			<CircleDollarSign className="h-5 w-5 text-gray-700" />

			<Select
				value={cryptoAsset}
				onValueChange={(value) => {
					setCryptoAsset(value);
				}}
			>
				<SelectTrigger id="crypto-asset" className="w-[100px]">
					<SelectValue placeholder="Asset" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Crypto</SelectLabel>
						<SelectItem value="xrp">XRP</SelectItem>
						<SelectItem value="btc">BTC</SelectItem>
						<SelectItem value="eth">ETH</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</CardContent>
	);
}

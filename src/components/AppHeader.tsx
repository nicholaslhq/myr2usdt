import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useCallback } from "react";

interface AppHeaderProps {
	inverted: boolean;
	onToggleInversion: () => void;
}

export default function AppHeader({
	inverted,
	onToggleInversion,
}: AppHeaderProps) {
	const title = "MYR2USDT";

	const handleToggle = useCallback(() => {
		onToggleInversion();
	}, [onToggleInversion]);

	const avatarFlipStyle = useMemo(
		() => ({
			transform: inverted ? "rotate(180deg)" : "rotate(0deg)",
			transition: "transform 0.3s ease",
		}),
		[inverted],
	);

	const iconFlipStyle = useMemo(
		() => ({
			transform: inverted ? "rotate(180deg)" : "rotate(0deg)",
			transition: "transform 0.3s ease",
		}),
		[inverted],
	);

	return (
		<CardHeader className="flex items-center justify-center">
			<CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
				<div style={avatarFlipStyle}>
					<Avatar className="size-6">
						<AvatarImage
							src="/favicon/favicon.svg"
							alt={`${title} Logo`}
						/>
						<AvatarFallback>
							{inverted ? "U2M" : "M2U"}
						</AvatarFallback>
					</Avatar>
				</div>
				<span>{title}</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 cursor-pointer rounded-full hover:bg-gray-200"
					onClick={handleToggle}
					aria-label="Toggle rate inversion"
				>
					<ArrowUpDown className="h-4 w-4" style={iconFlipStyle} />
				</Button>
			</CardTitle>
		</CardHeader>
	);
}

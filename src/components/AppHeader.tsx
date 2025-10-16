import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AppHeader() {
	return (
		<CardHeader className="flex items-center justify-center">
			<CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
				<Avatar className="size-6">
					<AvatarImage
						src="/favicon/favicon.svg"
						alt="MYR2USDT Logo"
					/>
					<AvatarFallback>M2U</AvatarFallback>
				</Avatar>
				<span>MYR2USDT</span>
			</CardTitle>
		</CardHeader>
	);
}

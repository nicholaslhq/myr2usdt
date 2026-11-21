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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import React, { useEffect, useState } from "react";

type Theme = "light" | "dark" | "crypto";

interface SettingsDialogProps {
	showChart: boolean;
	setShowChart: (show: boolean) => void;
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

function SettingsDialog({
	showChart,
	setShowChart,
	theme,
	setTheme,
}: SettingsDialogProps) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("dark", "crypto");
		if (theme === "dark") {
			root.classList.add("dark");
		} else if (theme === "crypto") {
			root.classList.add("crypto");
		}
	}, [theme]);

	const THEME_OPTIONS: { value: Theme; label: string }[] = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "crypto", label: "Crypto" },
	];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex-1 cursor-pointer" aria-label="Open settings">
					<Settings className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Configure display and appearance options.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex flex-col space-y-1">
							<Label>Show Chart</Label>
							<p className="text-xs text-muted-foreground">
								Toggle the exchange rate chart visibility
							</p>
						</div>
						<Switch
							checked={showChart}
							onCheckedChange={setShowChart}
						/>
					</div>
					<div className="flex flex-col space-y-2">
						<Label>Theme</Label>
						<Select
							value={theme}
							onValueChange={setTheme}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{THEME_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" className="cursor-pointer">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default SettingsDialog;

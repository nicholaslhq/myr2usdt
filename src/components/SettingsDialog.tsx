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
import {
	Settings,
	Heart,
	Github,
	ExternalLink,
	MessageCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

type Theme = "light" | "dark";

interface SettingsDialogProps {
	showChart: boolean;
	setShowChart: (show: boolean) => void;
	showBadges: boolean;
	setShowBadges: (show: boolean) => void;
	showSelectors: boolean;
	setShowSelectors: (show: boolean) => void;
	allowMultiplePins: boolean;
	setAllowMultiplePins: (show: boolean) => void;
	theme: Theme;
	setTheme: (theme: Theme) => void;
	refreshInterval: number;
	setRefreshInterval: (interval: number) => void;
}

function SettingsDialog({
	showChart,
	setShowChart,
	showBadges,
	setShowBadges,
	showSelectors,
	setShowSelectors,
	allowMultiplePins,
	setAllowMultiplePins,
	theme,
	setTheme,
	refreshInterval,
	setRefreshInterval,
}: SettingsDialogProps) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("dark");
		if (theme === "dark") {
			root.classList.add("dark");
		}
	}, [theme]);

	const THEME_OPTIONS: { value: Theme; label: string }[] = [
		{ value: "dark", label: "Dark" },
		{ value: "light", label: "Light" },
	];

	const REFRESH_INTERVAL_OPTIONS: { value: number; label: string }[] = [
		{ value: 30_000, label: "30 seconds" },
		{ value: 60_000, label: "1 minute" },
		{ value: 2 * 60_000, label: "2 minutes" },
		{ value: 5 * 60_000, label: "5 minutes" },
		{ value: 10 * 60_000, label: "10 minutes" },
		{ value: 30 * 60_000, label: "30 minutes" },
	];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="flex-1 cursor-pointer"
					aria-label="Open settings"
				>
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
					<div className="flex items-center justify-between gap-4">
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
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col space-y-1">
							<Label>External Rates Badges</Label>
							<p className="text-xs text-muted-foreground">
								Toggle external rates badges visibility
							</p>
						</div>
						<Switch
							checked={showBadges}
							onCheckedChange={setShowBadges}
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col space-y-1">
							<Label>Platform Asset Selectors</Label>
							<p className="text-xs text-muted-foreground">
								Toggle platform asset selectors visibility
							</p>
						</div>
						<Switch
							checked={showSelectors}
							onCheckedChange={setShowSelectors}
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col space-y-1">
							<Label>Allow Multiple Pinned Dialogs</Label>
							<p className="text-xs text-muted-foreground">
								Allow pinning more than one dialog to the main
								screen
							</p>
						</div>
						<Switch
							checked={allowMultiplePins}
							onCheckedChange={setAllowMultiplePins}
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col space-y-1">
							<Label>Refresh Interval</Label>
							<p className="text-xs text-muted-foreground">
								How often to fetch the latest exchange rates
							</p>
						</div>
						<Select
							value={String(refreshInterval)}
							onValueChange={(value) =>
								setRefreshInterval(Number(value))
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{REFRESH_INTERVAL_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={String(option.value)}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col space-y-1">
							<Label>Theme</Label>
							<p className="text-xs text-muted-foreground">
								Select the color theme for the application
							</p>
						</div>
						<Select value={theme} onValueChange={setTheme}>
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

				{/* Attribution */}
				<div className="pt-4">
					<div className="relative rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 text-center overflow-hidden hover:border-primary/20 transition-all duration-300">
						{/* Subtle animated shimmer */}
						<div
							className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"
							style={{ animationDuration: "3s" }}
						/>
						{/* Corner accents */}
						<div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-primary/10 blur-2xl" />
						<div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-accent/10 blur-2xl" />
						<div className="relative flex flex-col items-center gap-2">
							{/* Attribution */}
							<p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
								Built with{" "}
								<Heart
									className="h-3 w-3 text-red-500 inline-block align-middle"
									style={{
										animation:
											"heartbeat 1.5s ease-in-out infinite",
										transformOrigin: "center",
									}}
								/>
								{" by Nicholas"}
							</p>
							{/* Actions */}
							<div className="flex items-center gap-2 mt-1">
								<a
									href="https://nlhq.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground transition-colors border border-border/50"
								>
									<ExternalLink className="h-3 w-3" />
									nlhq
								</a>
								<a
									href="https://github.com/nicholaslhq/myr2usdt"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground transition-colors border border-border/50"
								>
									<Github className="h-3 w-3" />
									Source
								</a>
								<a
									href="https://github.com/nicholaslhq/myr2usdt/issues"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground transition-colors border border-border/50"
								>
									<MessageCircle className="h-3 w-3" />
									Feedback
								</a>
							</div>
						</div>
					</div>
					{/* Heartbeat keyframes injected once */}
					<style
						dangerouslySetInnerHTML={{
							__html: `
							@keyframes heartbeat {
								0%, 100% { transform: scale(1); }
								50% { transform: scale(1.15); }
							}
						`,
						}}
					/>
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

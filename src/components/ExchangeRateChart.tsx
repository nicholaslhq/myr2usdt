"use client";

import { CardContent } from "@/components/ui/card";
import React, { useMemo } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartData,
	TooltipItem,
	ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { HistoricalRate } from "@/lib/api";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const CHART_POINTS_THRESHOLD = 20;
const CHART_BG_COLOR = "rgba(249, 250, 251, 0.8)";
const TOOLTIP_BG = "rgba(0, 0, 0, 0.7)";
const LINE_COLOR = "#26A17B";

interface ExchangeRateChartProps {
	historicalRates: HistoricalRate[];
	pointThreshold?: number;
	inverted: boolean;
}

function buildChartData(
	historicalRates: HistoricalRate[],
	inverted: boolean
): ChartData<"line"> {
	const hidePoints = historicalRates.length > CHART_POINTS_THRESHOLD;

	return {
		labels: historicalRates.map((rate) =>
			new Date(rate.timestamp).toLocaleTimeString()
		),
		datasets: [
			{
				label: "Exchange Rate",
				data: historicalRates.map((rate) =>
					inverted ? 1 / rate.rate : rate.rate
				),
				fill: false,
				borderColor: LINE_COLOR,
				borderWidth: 2,
				tension: 0.4,
				cubicInterpolationMode: "monotone",
				pointRadius: hidePoints ? 0 : 3,
				pointHoverRadius: hidePoints ? 0 : 5,
			},
		],
	};
}

// Tooltip callback factory - captures historicalRates at creation time
function buildTooltipCallback(
	historicalRates: HistoricalRate[],
	inverted: boolean
): (context: TooltipItem<"line">) => string | string[] {
	return function (context: TooltipItem<"line">) {
		const historicalRate =
			historicalRates[context.dataIndex];
		if (
			!historicalRate ||
			historicalRate.rate === undefined ||
			historicalRate.rate === null
		) {
			return "N/A";
		}
		const displayRate = inverted ? 1 / historicalRate.rate : historicalRate.rate;
		const labels: string[] = [];
		labels.push(`Rate: ${displayRate.toFixed(4)}`);
		if (historicalRate.sourcePlatform) {
			labels.push(`Source: ${historicalRate.sourcePlatform}`);
		}
		if (historicalRate.targetPlatform) {
			labels.push(`Target: ${historicalRate.targetPlatform}`);
		}
		if (historicalRate.cryptoAsset) {
			labels.push(`Crypto: ${historicalRate.cryptoAsset}`);
		}
		return labels;
	};
}

export default React.memo(function ExchangeRateChart({
	historicalRates,
	pointThreshold = CHART_POINTS_THRESHOLD,
	inverted,
}: ExchangeRateChartProps) {
	const hidePoints = historicalRates.length > pointThreshold;

	const data = useMemo(
		() => buildChartData(historicalRates, inverted),
		[historicalRates, inverted]
	);

	const tooltipCallback = useMemo(
		() => buildTooltipCallback(historicalRates, inverted),
		[historicalRates, inverted]
	);

	const options: ChartOptions<"line"> = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			backgroundColor: CHART_BG_COLOR,
			plugins: {
				legend: {
					display: false,
					position: "top" as const,
				},
				tooltip: {
					enabled: !hidePoints,
					callbacks: {
						label: tooltipCallback,
					},
					backgroundColor: TOOLTIP_BG,
					titleColor: "#fff",
					bodyColor: "#fff",
					borderColor: "rgba(255, 255, 255, 0.5)",
					borderWidth: 1,
				},
				title: {
					display: false,
					text: "Historical Exchange Rate Trend",
				},
			},
			scales: {
				x: {
					title: { display: false },
					grid: { display: false },
					ticks: { display: false },
					border: { display: false },
				},
				y: {
					title: { display: false },
					grid: { display: false },
					ticks: {
						display: true,
						maxTicksLimit: 5,
					},
					border: { display: false },
				},
			},
			layout: {
				padding: { left: 0, right: 0, top: 0, bottom: 0 },
			},
		}),
		[hidePoints, tooltipCallback]
	);

	return (
		<CardContent>
			<Line data={data} options={options} />
		</CardContent>
	);
});

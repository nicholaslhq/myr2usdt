"use client";

import { CardContent } from "@/components/ui/card";
import React from "react";
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

interface ExchangeRateChartProps {
	historicalRates: HistoricalRate[];
}

export default function ExchangeRateChart({
	historicalRates,
}: ExchangeRateChartProps) {
	const data: ChartData<"line"> = {
		labels: historicalRates.map((rate) =>
			new Date(rate.timestamp).toLocaleTimeString()
		),
		datasets: [
			{
				label: "Exchange Rate",
				data: historicalRates.map((rate) => rate.rate),
				fill: false,
				borderColor: "#26A17B",
				borderWidth: 2,
				tension: 0.4,
				cubicInterpolationMode: "monotone",
			},
		],
	};

	const options: ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: false,
		backgroundColor: "rgba(249, 250, 251, 0.8)", // Light gray background for the chart area
		plugins: {
			legend: {
				display: false,
				position: "top" as const,
			},
			tooltip: {
				callbacks: {
					label: function (context: TooltipItem<"line">) {
						const historicalRate =
							historicalRates[context.dataIndex];
						if (
							!historicalRate ||
							historicalRate.rate === undefined ||
							historicalRate.rate === null
						) {
							return "N/A"; // Return a default label if historicalRate or its rate is undefined/null
						}
						const labels: string[] = [];
						labels.push(`Rate: ${historicalRate.rate.toFixed(4)}`);
						if (historicalRate.sourcePlatform) {
							labels.push(
								`Source: ${historicalRate.sourcePlatform}`
							);
						}
						if (historicalRate.targetPlatform) {
							labels.push(
								`Target: ${historicalRate.targetPlatform}`
							);
						}
						if (historicalRate.cryptoAsset) {
							labels.push(`Asset: ${historicalRate.cryptoAsset}`);
						}
						return labels;
					},
				},
				backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker tooltip background
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
				title: {
					display: false,
				},
				grid: {
					display: false,
				},
				ticks: {
					display: false,
				},
				border: {
					display: false,
				},
			},
			y: {
				title: {
					display: false,
				},
				grid: {
					display: false,
				},
				ticks: {
					display: false,
				},
				border: {
					display: false,
				},
			},
		},
		layout: {
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
		},
	};

	return (
		<CardContent>
			<Line data={data} options={options} />
		</CardContent>
	);
}

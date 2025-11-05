import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HistoricalRate } from "./api";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function downsampleHistoricalRates(
	rates: HistoricalRate[],
	currentTime: number
): HistoricalRate[] {
	if (!rates.length) return [];

	const oneHourAgo = currentTime - 60 * 60 * 1000; // 1 hour
	const twelveHoursAgo = currentTime - 12 * 60 * 60 * 1000; // 12 hours

	// Ensure chronological order
	const sortedRates = [...rates].sort((a, b) => a.timestamp - b.timestamp);

	const newRates: HistoricalRate[] = [];

	const fiveMinBuckets: Record<number, HistoricalRate[]> = {};
	const hourlyBuckets: Record<number, HistoricalRate[]> = {};

	// --- Split into appropriate buckets ---
	for (const rate of sortedRates) {
		if (rate.timestamp > oneHourAgo) {
			// Keep 1-min resolution for last hour
			newRates.push(rate);
		} else if (rate.timestamp > twelveHoursAgo) {
			// Aggregate to 5-min intervals
			const bucketStart =
				Math.floor(rate.timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);
			if (!fiveMinBuckets[bucketStart]) fiveMinBuckets[bucketStart] = [];
			fiveMinBuckets[bucketStart].push(rate);
		} else {
			// Aggregate to hourly intervals
			const bucketStart =
				Math.floor(rate.timestamp / (60 * 60 * 1000)) *
				(60 * 60 * 1000);
			if (!hourlyBuckets[bucketStart]) hourlyBuckets[bucketStart] = [];
			hourlyBuckets[bucketStart].push(rate);
		}
	}

	// --- Helper to average each bucket ---
	const aggregateBucket = (bucket: HistoricalRate[]): HistoricalRate => {
		const { sumRate, sumTimestamp } = bucket.reduce(
			(acc, r) => ({
				sumRate: acc.sumRate + r.rate,
				sumTimestamp: acc.sumTimestamp + r.timestamp,
			}),
			{ sumRate: 0, sumTimestamp: 0 }
		);

		const avgRate = sumRate / bucket.length;
		const avgTimestamp = Math.floor(sumTimestamp / bucket.length);

		// Reuse metadata from the last rate (so source/target/asset remain consistent)
		return {
			...bucket[bucket.length - 1],
			rate: avgRate,
			timestamp: avgTimestamp,
		};
	};

	// --- Add hourly aggregates ---
	Object.keys(hourlyBuckets)
		.map(Number)
		.forEach((t) => newRates.push(aggregateBucket(hourlyBuckets[t])));

	// --- Add 5-min aggregates ---
	Object.keys(fiveMinBuckets)
		.map(Number)
		.forEach((t) => newRates.push(aggregateBucket(fiveMinBuckets[t])));

	// --- Final chronological sort ---
	newRates.sort((a, b) => a.timestamp - b.timestamp);

	return newRates;
}

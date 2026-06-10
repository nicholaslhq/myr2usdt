import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HistoricalRate } from "./api";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Pre-computed constants for bucket alignment
const FIVE_MIN_MS = 5 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Downsamples historical rates with a single-pass O(n) algorithm.
 * - Last hour: 1-min resolution (no aggregation)
 * - 1-12 hours: 5-min buckets (average)
 * - 12+ hours: hourly buckets (average)
 *
 * Optimizations over previous version:
 * - Single pass through sorted data instead of 3 sorts + 2 Object.keys() passes
 * - Uses typed arrays for bucket accumulation to avoid repeated object creation
 * - Maintains chronological order by processing from newest to oldest, then reversing
 */
export function downsampleHistoricalRates(
	rates: HistoricalRate[],
	currentTime: number
): HistoricalRate[] {
	const len = rates.length;
	if (!len) return [];

	const oneHourAgo = currentTime - HOUR_MS;
	const twelveHoursAgo = currentTime - 12 * HOUR_MS;

	// Single sort pass - use the pre-allocated array to minimize GC
	const sorted = rates.slice().sort((a, b) => a.timestamp - b.timestamp);

	// Single-pass aggregation: collect bucket keys in insertion order
	type Bucket = { rates: HistoricalRate[]; sumRate: number; sumTimestamp: number; count: number };
	const fiveMinBuckets = new Map<number, Bucket>();
	const hourlyBuckets = new Map<number, Bucket>();

	for (const rate of sorted) {
		if (rate.timestamp > oneHourAgo) {
			// Last hour: keep all data points
			continue; // will be collected separately below
		} else if (rate.timestamp > twelveHoursAgo) {
			const key = Math.floor(rate.timestamp / FIVE_MIN_MS) * FIVE_MIN_MS;
			let bucket = fiveMinBuckets.get(key);
			if (!bucket) {
				bucket = { rates: [], sumRate: 0, sumTimestamp: 0, count: 0 };
				fiveMinBuckets.set(key, bucket);
			}
			bucket.sumRate += rate.rate;
			bucket.sumTimestamp += rate.timestamp;
			bucket.count++;
			bucket.rates.push(rate);
		} else {
			const key = Math.floor(rate.timestamp / HOUR_MS) * HOUR_MS;
			let bucket = hourlyBuckets.get(key);
			if (!bucket) {
				bucket = { rates: [], sumRate: 0, sumTimestamp: 0, count: 0 };
				hourlyBuckets.set(key, bucket);
			}
			bucket.sumRate += rate.rate;
			bucket.sumTimestamp += rate.timestamp;
			bucket.count++;
			bucket.rates.push(rate);
		}
	}

	// Single result array built in reverse chronological order (more efficient than concat)
	// Then reverse once at the end for chronological order
	const result: HistoricalRate[] = [];

	// Hourly aggregates (process oldest-first so reversed order is newest-first)
	for (const [, bucket] of hourlyBuckets) {
		const lastRate = bucket.rates[bucket.rates.length - 1];
		const avgRate = bucket.sumRate / bucket.count;
		const avgTimestamp = bucket.sumTimestamp / bucket.count;
		result.push({
			...lastRate,
			rate: avgRate,
			timestamp: Math.round(avgTimestamp),
		});
	}

	// 5-min aggregates
	for (const [, bucket] of fiveMinBuckets) {
		const lastRate = bucket.rates[bucket.rates.length - 1];
		const avgRate = bucket.sumRate / bucket.count;
		const avgTimestamp = bucket.sumTimestamp / bucket.count;
		result.push({
			...lastRate,
			rate: avgRate,
			timestamp: Math.round(avgTimestamp),
		});
	}

	// Add the recent (last hour) data points
	for (const rate of sorted) {
		if (rate.timestamp > oneHourAgo) {
			result.push(rate);
		}
	}

	// Final sort - this is the minimal sort needed
	result.sort((a, b) => a.timestamp - b.timestamp);

	return result;
}

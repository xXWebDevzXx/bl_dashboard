/**
 * Helper functions for boxplot calculations
 */

/**
 * Parses estimate string to hours (midpoint for ranges).
 * Handles formats like "1-2" => 1.5, "4-8" => 6.0, "5" => 5.0
 * Returns null if the string is empty or invalid.
 */
export function parseEstimateToHours(estimate: string): number | null {
  if (!estimate || estimate.trim() === "") {
    return null;
  }

  // Find all ranges in the estimate string (e.g., "1-2" or "4-8")
  const rangeMatches = estimate.matchAll(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/g);
  const ranges = Array.from(rangeMatches);

  if (ranges.length > 0) {
    // Extract all mins and maxs
    const mins = ranges.map((match) => parseFloat(match[1]));
    const maxs = ranges.map((match) => parseFloat(match[2]));

    // Use midpoint of the most conservative range (min of all mins, max of all maxs)
    const min = Math.min(...mins);
    const max = Math.max(...maxs);
    const midpoint = (min + max) / 2;

    return midpoint;
  }

  // Otherwise, try to parse as a single number
  const singleNumber = parseFloat(estimate);
  if (isNaN(singleNumber)) {
    return null;
  }

  return singleNumber;
}

/**
 * Computes quartiles and outliers using Tukey method (1.5 * IQR).
 * Returns min, q1, median, q3, max, whiskerMin, whiskerMax, and outliers.
 */
export function computeQuartiles(
  values: number[]
): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  whiskerMin: number;
  whiskerMax: number;
  outliers: number[];
} {
  if (values.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      whiskerMin: 0,
      whiskerMax: 0,
      outliers: [],
    };
  }

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate quartiles
  const min = sorted[0];
  const max = sorted[n - 1];

  // Helper to get percentile
  const percentile = (arr: number[], p: number): number => {
    if (arr.length === 0) return 0;
    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return arr[lower] * (1 - weight) + arr[upper] * weight;
  };

  const q1 = percentile(sorted, 0.25);
  const median = percentile(sorted, 0.5);
  const q3 = percentile(sorted, 0.75);

  // Calculate IQR and whisker bounds (Tukey method: 1.5 * IQR)
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Find outliers (values outside whisker bounds)
  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);

  // Whiskers extend to the last non-outlier value
  const whiskerMin = sorted.find((v) => v >= lowerBound) ?? min;
  // Find whiskerMax from the end (reverse search)
  const sortedReversed = [...sorted].reverse();
  const whiskerMax = sortedReversed.find((v) => v <= upperBound) ?? max;

  return {
    min,
    q1,
    median,
    q3,
    max,
    whiskerMin,
    whiskerMax,
    outliers: outliers.slice(0, 50).sort((a, b) => a - b), // Limit to 50 and sort
  };
}

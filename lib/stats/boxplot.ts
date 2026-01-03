/**
 * Shared boxplot statistics helper functions
 * Handles quantiles, IQR, whiskers, outliers, mean, p95, min/max
 * with NaN/Infinity guards and proper sorting
 */

export interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  p95: number;
  iqr: number;
  whiskerLow: number;
  whiskerHigh: number;
  n: number;
  outlierCount: number;
  outliers: number[];
}

/**
 * Filters out NaN and Infinity values, sorts the array
 */
function sanitizeValues(values: number[]): number[] {
  return values
    .filter((v) => !isNaN(v) && isFinite(v))
    .sort((a, b) => a - b);
}

/**
 * Calculates percentile using linear interpolation
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Computes comprehensive boxplot statistics using Tukey method (1.5 * IQR)
 */
export function computeBoxplotStats(values: number[]): BoxplotStats {
  const sorted = sanitizeValues(values);

  if (sorted.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      mean: 0,
      p95: 0,
      iqr: 0,
      whiskerLow: 0,
      whiskerHigh: 0,
      n: 0,
      outlierCount: 0,
      outliers: [],
    };
  }

  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];

  // Calculate quartiles
  const q1 = percentile(sorted, 0.25);
  const median = percentile(sorted, 0.5);
  const q3 = percentile(sorted, 0.75);
  const p95 = percentile(sorted, 0.95);

  // Calculate mean
  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;

  // Calculate IQR and whisker bounds (Tukey method: 1.5 * IQR)
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Find outliers (values outside whisker bounds)
  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);

  // Whiskers extend to the last non-outlier value
  const whiskerLow = sorted.find((v) => v >= lowerBound) ?? min;
  const sortedReversed = [...sorted].reverse();
  const whiskerHigh = sortedReversed.find((v) => v <= upperBound) ?? max;

  return {
    min,
    q1,
    median,
    q3,
    max,
    mean,
    p95,
    iqr,
    whiskerLow,
    whiskerHigh,
    n,
    outlierCount: outliers.length,
    outliers: outliers.slice(0, 50).sort((a, b) => a - b), // Limit to 50 and sort
  };
}


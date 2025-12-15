/**
 * Parses estimate string to extract the range bounds.
 * Handles formats like "1-2", "4-8", or just "5".
 * If multiple ranges are present (e.g., "8-10, 8-12"), uses the most conservative range
 * (minimum of all mins, maximum of all maxs) to give the most generous accuracy assessment.
 * Returns { min, max, midpoint, displayFormat } for ranges, or all three equal for single values.
 */
export function parseEstimateRange(estimate: string): {
  min: number;
  max: number;
  midpoint: number;
  displayFormat: string;
} {
  if (!estimate || estimate.trim() === "") {
    return { min: 0, max: 0, midpoint: 0, displayFormat: "" };
  }

  // Find all ranges in the estimate string (e.g., "8-10" or "8-12")
  const rangeMatches = estimate.matchAll(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/g);
  const ranges = Array.from(rangeMatches);

  if (ranges.length > 0) {
    // Extract all mins and maxs
    const mins = ranges.map((match) => parseFloat(match[1]));
    const maxs = ranges.map((match) => parseFloat(match[2]));

    // Use most conservative range: minimum of all mins, maximum of all maxs
    const min = Math.min(...mins);
    const max = Math.max(...maxs);
    const midpoint = (min + max) / 2;

    // Display format: if min and max are the same, show single number, otherwise show range
    const displayFormat = min === max ? `${min}` : `${min}-${max}`;

    return { min, max, midpoint, displayFormat };
  }

  // Otherwise, try to parse as a single number
  const singleNumber = parseFloat(estimate);
  if (isNaN(singleNumber)) {
    return { min: 0, max: 0, midpoint: 0, displayFormat: "" };
  }

  return { min: singleNumber, max: singleNumber, midpoint: singleNumber, displayFormat: `${singleNumber}` };
}

/**
 * Parses estimate string to a number for calculations.
 * Handles formats like "1-2", "4-8", or just "5".
 * For ranges, returns the upper bound (more conservative estimate).
 * Returns 0 if the string is empty or invalid.
 */
export function parseEstimateToNumber(estimate: string): number {
  const { max } = parseEstimateRange(estimate);
  return max;
}

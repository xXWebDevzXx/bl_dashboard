/**
 * Parses estimate string to a number for calculations.
 * Handles formats like "1-2", "4-8", or just "5".
 * For ranges, returns the upper bound (more conservative estimate).
 * Returns 0 if the string is empty or invalid.
 */
export function parseEstimateToNumber(estimate: string): number {
  if (!estimate || estimate.trim() === "") {
    return 0;
  }

  // Check if it's a range (e.g., "1-2")
  const rangeMatch = estimate.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    // Return the upper bound for conservative estimation
    return parseFloat(rangeMatch[2]);
  }

  // Otherwise, try to parse as a single number
  const singleNumber = parseFloat(estimate);
  return isNaN(singleNumber) ? 0 : singleNumber;
}

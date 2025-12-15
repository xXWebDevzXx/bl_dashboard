/**
 * Formats hours to a human-readable format with hours and minutes.
 * Example: 1.87 -> "1h 52m"
 */
export function formatHoursToHM(hours: number): string {
  const h = Math.floor(Math.abs(hours));
  const m = Math.round((Math.abs(hours) - h) * 60);

  if (h === 0 && m === 0) {
    return "0m";
  }

  if (h === 0) {
    return `${m}m`;
  }

  if (m === 0) {
    return `${h}h`;
  }

  return `${h}h ${m}m`;
}

/**
 * Formats hours with a sign prefix for variance display.
 * Example: 1.87 -> "+ 1h 52m", -0.5 -> "- 0h 30m"
 */
export function formatHoursWithSign(hours: number): string {
  const sign = hours >= 0 ? "+ " : "- ";
  return sign + formatHoursToHM(hours);
}

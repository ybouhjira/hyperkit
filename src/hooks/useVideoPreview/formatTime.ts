/**
 * Formats a duration in seconds to MM:SS format
 *
 * @param seconds - Duration in seconds
 * @returns Formatted time string (e.g., "1:05", "61:01")
 *
 * @example
 * ```ts
 * formatTime(0)    // "0:00"
 * formatTime(61)   // "1:01"
 * formatTime(125)  // "2:05"
 * formatTime(3661) // "61:01"
 * ```
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(Math.abs(seconds) % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

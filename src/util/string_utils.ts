/**
 * Truncate a string.
 *
 * @param {string} s The string to be truncated.
 * @param {number} n The character count at which the string is to be truncated.
 * @returns The truncated string.
 */
export function truncateString(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}...`;
}

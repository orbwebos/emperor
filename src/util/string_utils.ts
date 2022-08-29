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

export function snakeCaseToCamelCase(s: string): string {
  return s
    .split('_')
    .reduce(
      (res, word, i) =>
        i === 0
          ? word.toLowerCase()
          : `${res}${word.charAt(0).toUpperCase()}${word
              .slice(1)
              .toLowerCase()}`,
      ''
    );
}

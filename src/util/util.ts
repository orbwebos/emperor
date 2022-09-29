export function prodOtherwise<T, U>(a: T, b: U): T | U {
  return process.env.NODE_ENV === 'production' ? a : b;
}

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
  const split = s.split('_');
  const first = split.shift();

  const capitalized = split.map(
    (str) => str.charAt(0).toUpperCase() + str.slice(1)
  );

  capitalized.unshift(first);

  return capitalized.join('');
}

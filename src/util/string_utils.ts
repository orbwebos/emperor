/**
 * Truncate a string.
 * Lifted from https://gist.github.com/DylanAttal/5ce8ba2c0f0d7e42e640f7207409cd1c#file-truncate-a-string-js
 * 
 * @param {string} s The string to be truncated.
 * @param {number} n The character count at which the string is to be truncated.
 * @returns The truncated string.
 */
export function truncateString(s: string, n: number): string {
    // If the length of str is less than or equal to num
    // just return str--don't truncate it.
    if (s.length <= n) {
        return s;
    }

    // Return str truncated with '...' concatenated to the end of str.
    return s.slice(0, n) + '...';
}

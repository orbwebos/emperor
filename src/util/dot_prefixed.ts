export function dotPrefixed(s: string, ...prefixWords: string[]) {
  const dot = '.';
  if (!s.startsWith(dot)) return false;

  const content = s.toLowerCase().replace(dot, '');

  return prefixWords.some((word) => content.startsWith(word));
}

import { join } from 'path';
import { appendFileSync, mkdirSync, readdirSync } from 'fs';

export function ensureDirectory(directory: string): void {
  // @ts-ignore Argument of type '{ recursive: boolean; }' is not assignable to parameter of type 'string | number'.
  mkdirSync(directory, { recursive: true });
}

export function prodOtherwise<T, U>(a: T, b: U): T | U {
  return process.env.NODE_ENV === 'production' ? a : b;
}

export function resolvePathFromSource(inputPath: string): string {
  return join(__dirname, '..', inputPath);
}

export function includesAny(input: string, ...values: string[]) {
  return values.some((s) => input.includes(s));
}

export function isAnyOf<T>(input: T, ...values: T[]) {
  return values.some((x) => input === x);
}

export function appendToGendocDocument(id: string, text: string): void {
  if (
    readdirSync(resolvePathFromSource('../data/gendoc')).includes(`${id}.md`)
  ) {
    throw new Error(`there is no gendoc document associated with id ${id}`);
  }

  const pathNoExtension = resolvePathFromSource(`../data/gendoc/${id}`);
  return appendFileSync(`${pathNoExtension}.md`, text);
}

export function isInArray<T>(array: T[], element: T) {
  return array.indexOf(element) !== -1;
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

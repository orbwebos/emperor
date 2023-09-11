import { basename, extname, join } from 'path';
import { appendFileSync, mkdirSync, readdirSync } from 'fs';
import { isNullOrUndefined } from 'util';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import {
  CategoryChannel,
  Channel,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  FetchMessagesOptions,
  Message,
  MessageContextMenuCommandInteraction,
  PartialGroupDMChannel,
  User,
  UserContextMenuCommandInteraction,
} from 'discord.js';

export type CommandObject =
  | ChatInputCommandInteraction
  | MessageContextMenuCommandInteraction
  | UserContextMenuCommandInteraction
  | ContextMenuCommandInteraction
  | Message;

export function ensureDirectory(directory: string): void {
  // @ts-ignore Argument of type '{ recursive: boolean; }' is not assignable to parameter of type 'string | number'.
  mkdirSync(directory, { recursive: true });
}

export function envSwitch<T>(input: {
  development?: T;
  testing?: T;
  production?: T;
}): T {
  switch (process.env.NODE_ENV?.toLowerCase()) {
    case 'production':
    case 'prod':
      return input?.production ?? undefined;
    case 'testing':
    case 'test':
      return input?.testing ?? undefined;
    default:
      return input?.development ?? undefined;
  }
}

export function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [items[i], items[j]] = [items[j], items[i]];
  }
}

export function userName(user: User): string {
  if (user.discriminator === '0000') {
    return user.username;
  }
  if (user.discriminator === '0') {
    return `@${user.username}`;
  }
  return user.tag;
}

export function isValidUrl(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (e) {
    return false;
  }
  return true;
}

export function registerSwitch(input: {
  development?: ApplicationCommandRegistry.RegisterOptions;
  testing?: ApplicationCommandRegistry.RegisterOptions;
  production?: ApplicationCommandRegistry.RegisterOptions;
}) {
  return envSwitch(input);
}

export function resolvePathFromSource(inputPath: string): string {
  return join(__dirname, '..', inputPath);
}

export function includesAll(input: string, ...values: string[]) {
  return values.every((s) => input.includes(s));
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

export function randomChoice<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

export function isNumber(input: unknown): input is number {
  return typeof input === 'number' && !Number.isNaN(input);
}

export async function asyncFilter<T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]> {
  const results: boolean[] = await Promise.all(arr.map(predicate));
  return arr.filter((_value, index) => results[index]);
}

export async function asyncMap<T, U>(
  arr: T[],
  callback: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
  const results: U[] = await Promise.all(arr.map(callback));
  return results;
}

export async function asyncFind<T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T | undefined> {
  for (let i = 0; i < arr.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (await predicate(arr[i], i, arr)) {
      return arr[i];
    }
  }

  return undefined;
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

export interface FilterFetchMessagesOptions extends FetchMessagesOptions {
  predicate: (message: Message) => Promise<boolean>;
}

export async function findFetchMessages(
  channel: Exclude<Channel, CategoryChannel | PartialGroupDMChannel>,
  options: FilterFetchMessagesOptions
): Promise<Message | undefined> {
  const messages = await channel.messages.fetch(options);

  // eslint-disable-next-line no-restricted-syntax
  for (const [, message] of messages) {
    // eslint-disable-next-line no-await-in-loop
    if (await options.predicate(message)) {
      return message;
    }
  }

  return undefined;
}

export async function filterFetchMessages(
  channel: Exclude<Channel, CategoryChannel | PartialGroupDMChannel>,
  options: FilterFetchMessagesOptions
): Promise<Message[]> {
  const returned: Message[] = [];
  const messages = await channel.messages.fetch(options);

  // eslint-disable-next-line no-restricted-syntax
  for (const [, message] of messages) {
    // eslint-disable-next-line no-await-in-loop
    if (await options.predicate(message)) {
      returned.push(message);
    }
  }

  return returned;
}

export interface MapFetchMessagesOptions<T> extends FetchMessagesOptions {
  mapper: (message: Message) => Promise<T>;
}

export async function mapFilterFetchMessages<T>(
  channel: Exclude<Channel, CategoryChannel | PartialGroupDMChannel>,
  options: MapFetchMessagesOptions<T>
): Promise<T[]> {
  const returned: T[] = [];
  const messages = await channel.messages.fetch(options);

  // eslint-disable-next-line no-restricted-syntax
  for (const [, message] of messages) {
    // eslint-disable-next-line no-await-in-loop
    const mapped = await options.mapper(message);
    if (!isNullOrUndefined(mapped)) {
      returned.push(mapped);
    }
  }

  return returned;
}

export async function mapFirstFetchMessages<T>(
  channel: Exclude<Channel, CategoryChannel | PartialGroupDMChannel>,
  options: MapFetchMessagesOptions<T>
): Promise<T> {
  const messages = await channel.messages.fetch(options);

  // eslint-disable-next-line no-restricted-syntax
  for (const [, message] of messages) {
    // eslint-disable-next-line no-await-in-loop
    const mapped = await options.mapper(message);
    if (!isNullOrUndefined(mapped)) {
      return mapped;
    }
  }

  return undefined;
}

export async function mapFindFetchMessages<T>(
  channel: Exclude<Channel, CategoryChannel | PartialGroupDMChannel>,
  options: MapFetchMessagesOptions<T>
): Promise<T> {
  const messages = await channel.messages.fetch(options);

  // eslint-disable-next-line no-restricted-syntax
  for (const [, message] of messages) {
    // eslint-disable-next-line no-await-in-loop
    const mapped = await options.mapper(message);
    if (!isNullOrUndefined(mapped)) {
      return mapped;
    }
  }

  return undefined;
}

export function filterMapFindLast<T, U>(
  arr: Array<T>,
  mapper: (obj: T) => U
): U {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const mapped = mapper(arr[i]);
    if (!isNullOrUndefined(mapped)) {
      return mapped;
    }
  }

  return undefined;
}

export function filterMapFindLastForMap<K, V, T>(
  map: Map<K, V>,
  mapper: (value: V, key: K, map: Map<K, V>) => T
): T | undefined {
  const entries = Array.from(map.entries());
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const [key, value] = entries[i];
    const mapped = mapper(value, key, map);
    if (!isNullOrUndefined(mapped)) {
      return mapped;
    }
  }

  return undefined;
}

export async function asyncFilterMapFindLastForMap<K, V, T>(
  map: Map<K, V>,
  mapper: (value: V, key: K, map: Map<K, V>) => Promise<T>
): Promise<T | undefined> {
  const entries = Array.from(map.entries());
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const [key, value] = entries[i];
    // eslint-disable-next-line no-await-in-loop
    const mapped = await mapper(value, key, map);
    if (!isNullOrUndefined(mapped)) {
      return mapped;
    }
  }

  return undefined;
}

export async function asyncFilterMapLast<T, U>(
  arr: Array<T>,
  mapper: (obj: T) => Promise<U>
): Promise<U> {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    // eslint-disable-next-line no-await-in-loop
    const mapped = await mapper(arr[i]);
    if (!isNullOrUndefined(mapped)) {
      return mapped;
    }
  }

  return undefined;
}

export function extractFilenameFromUrl(
  url: URL
): { full: string; name: string; extension: string } | undefined {
  const baseName = basename(url.pathname);
  const extName = extname(url.pathname);

  if (extName) {
    return {
      full: baseName,
      name: basename(baseName, extName),
      extension: extName,
    };
  }

  return undefined;
}

export function plural<T extends Array<any> | Map<any, any>>(obj: T) {
  return obj.entries.length === 1 ? '' : 's';
}

import * as fs from 'fs';

export function ensureDirectory(directory: string): void {
  // @ts-ignore Argument of type '{ recursive: boolean; }' is not assignable to parameter of type 'string | number'.
  fs.mkdirSync(directory, { recursive: true });
}

import { join } from 'path';

export function resolvePathFromSource(inputPath: string): string {
  return join(__dirname, '..', inputPath);
}

import * as path from 'path';

export function resolvePathFromSource(inputPath: string): string {
  return path.join(__dirname, '..', inputPath);
}

import path from 'path';
import * as config from '../../config/bot.json';

export function resolvePathFromSource(inputPath: string): string {
  return path.resolve(config.source_path, inputPath);
}

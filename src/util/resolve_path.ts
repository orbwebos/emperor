import path from 'path';
import * as config from '../../config.json';

export function resolvePath(inputPath: string): string {
	return path.resolve(config.basePath, inputPath);
}
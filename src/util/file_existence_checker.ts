import * as fs from 'fs';
import { resolvePath } from './resolve_path';

export async function fileExists(path: string): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		fs.access(resolvePath(path), (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					resolve(false);
				}
				reject(err);
			}
			resolve(true);
		});
	});
}
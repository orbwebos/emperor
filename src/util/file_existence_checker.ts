import * as fs from 'fs';
import { resolvePathFromSource } from './resolve_path';

export async function fileExists(path: string): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    fs.access(resolvePathFromSource(path), (err) => {
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

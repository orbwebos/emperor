import { appendFileSync, readdirSync } from 'fs';
import { resolvePathFromSource } from './resolve_path';

export function appendToGendocDocument(id: string, text: string): void {
  if (
    readdirSync(resolvePathFromSource('../data/gendoc')).includes(`${id}.md`)
  ) {
    throw new Error(`there is no gendoc document associated with id ${id}`);
  }

  const pathNoExtension = resolvePathFromSource(`../data/gendoc/${id}`);
  return appendFileSync(`${pathNoExtension}.md`, text);
}

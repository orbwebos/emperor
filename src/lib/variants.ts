export function variants(...str: string[]): string[] {
  return str.flatMap((s) => {
    const separated = s.toLowerCase().split(/[\s-_.,]+/);
    return [separated.join('_'), separated.join('-'), separated.join('')];
  });
}

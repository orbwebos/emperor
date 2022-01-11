type PluralIndicator = {
  s: string;
  isare: string;
  hashave: string;
  yies: string;
}

export function plural(obj: Array<any> | Map<any, any>): PluralIndicator {
  return !((Array.isArray(obj) && obj.length > 1) || (obj instanceof Map && obj.size > 1))
    ? {s: '', isare: 'is', hashave: 'has', yies: 'y'}
    : {s: 's', isare: 'are', hashave: 'have', yies: 'ies'};
}

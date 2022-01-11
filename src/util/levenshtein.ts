// levenshtein distance implementation from:
// https://gist.github.com/andrei-m/982927#gistcomment-1931258
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let tmp: string, i: number, j: number, prev: number, val: number, row: any[];
  // swap to save some memory O(min(a,b)) instead of O(a)
  if (a.length > b.length) {
    tmp = a;
    a = b;
    b = tmp;
  }

  row = Array(a.length + 1);
  // init the row
  for (i = 0; i <= a.length; i++) {
    row[i] = i;
  }

  // fill in the rest
  for (i = 1; i <= b.length; i++) {
    prev = i;
    for (j = 1; j <= a.length; j++) {
      if (b[i-1] === a[j-1]) {
        val = row[j-1]; // match
      }
      else {
        val = Math.min(row[j-1] + 1,  // substitution
          Math.min(prev + 1,          // insertion
          row[j] + 1));               // deletion
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }
  return row[a.length];
}

export function levenshteinInThreshold(threshold: number, a: string, b: string): boolean {
  return levenshteinDistance(a, b) <= threshold;
}

export function levenshteinMatches(list: string[], s: string, threshold?: number, lookahead?: number, referenceRules?: ((s: string) => string)[], inputRules?: ((s: string) => string)[]): {matched: boolean, reference: {used: string, original: string}, input: {used: string, original: string}} {
  if (!threshold) {
    threshold = 2;
  }
  if (!lookahead) {
    lookahead = 3;
  }
  if (!referenceRules) {
    referenceRules = [];
  }
  if (!inputRules) {
    inputRules = [];
  }

  const split = s.split(/[\n\r\s]+/);
  for (const i in list) {
    for (const j in split) {
      for (let k = 0; k <= lookahead; k++) {
        let refphrase = list[i];
        let bufphrase = split[j];
        for (let a = 1; a <= k; a++) {
          if ((parseInt(j) + a) < split.length) {
            bufphrase += ` ${split[(parseInt(j) + a).toString()]}`;
          }
        }
        if (referenceRules.length) {
          for (const l in referenceRules) {
            let refphraseMod = referenceRules[l](refphrase);
            if (inputRules.length) {
              for (const m in inputRules) {
                let bufphraseMod = inputRules[m](bufphrase);
                if (levenshteinInThreshold(threshold, refphraseMod, bufphraseMod)) return {matched: true, reference: {used: refphraseMod, original: list[i]}, input: {used: bufphraseMod, original: s}};
              }
            }
            else {
              if (levenshteinInThreshold(threshold, refphraseMod, bufphrase)) return {matched: true, reference: {used: refphraseMod, original: list[i]}, input: {used: bufphrase, original: s}};
            }
          }
        }
        else if (inputRules.length) {
          for (const l in inputRules) {
            let bufphraseMod = inputRules[l](bufphrase);
            if (levenshteinInThreshold(threshold, refphrase, bufphraseMod)) return {matched: true, reference: {used: refphrase, original: list[i]}, input: {used: bufphraseMod, original: s}};
          }
        }
        else {
          if (levenshteinInThreshold(threshold, refphrase, bufphrase)) return {matched: true, reference: {used: refphrase, original: list[i]}, input: {used: bufphrase, original: s}};
        }
      }
    }
  }

  return {matched: false, reference: {used: '', original: ''}, input: {used: '', original: s}};
}

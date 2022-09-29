/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { ConfigManager } from './config_manager';

const wfConfig = new ConfigManager().wordFilter();

// levenshtein distance implementation from:
// https://gist.github.com/andrei-m/982927#gistcomment-1931258
export function levenshteinDistance(a: string, b: string): number {
  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  let tmp: string;
  let i: number;
  let j: number;
  let prev: number;
  let val: number;
  // swap to save some memory O(min(a,b)) instead of O(a)
  if (a.length > b.length) {
    tmp = a;
    // eslint-disable-next-line no-param-reassign
    a = b;
    // eslint-disable-next-line no-param-reassign
    b = tmp;
  }

  const row = Array(a.length + 1);
  // init the row
  for (i = 0; i <= a.length; i += 1) {
    row[i] = i;
  }

  // fill in the rest
  for (i = 1; i <= b.length; i += 1) {
    prev = i;

    for (j = 1; j <= a.length; j += 1) {
      if (b[i - 1] === a[j - 1]) {
        val = row[j - 1]; // match
      } else {
        val = Math.min(
          row[j - 1] + 1, // substitution

          Math.min(
            prev + 1, // insertion
            row[j] + 1
          )
        ); // deletion
      }

      row[j - 1] = prev;
      prev = val;
    }

    row[a.length] = prev;
  }

  return row[a.length];
}

const levenshteinInThreshold = (
  threshold: number,
  a: string,
  b: string
): boolean => levenshteinDistance(a, b) <= threshold;

function excepted(s: string): boolean {
  return (wfConfig.exceptions as string[]).some((excep) =>
    new RegExp(excep).test(s)
  );
}

// fix this typing mess

type levenshteinTuple = {
  used: string;
  original: string;
};

export type LevenshteinResult = {
  matched: boolean;
  reference: levenshteinTuple;
  input: levenshteinTuple;
};

export interface LevenshteinOptions {
  filteredWords: string[];
  text: string;
  threshold?: number;
  lookahead?: number;
  referenceRules?: ((s: string) => string)[];
  inputRules?: ((s: string) => string)[];
}

export function levenshteinMatches(
  options: LevenshteinOptions
): LevenshteinResult {
  const threshold = options.threshold ?? 2;
  const lookahead = options.threshold ?? 3;
  const referenceRules = options.referenceRules ?? [];
  const inputRules = options.inputRules ?? [];

  const split = options.text.split(/[\n\r\s]+/);

  for (const word of options.filteredWords) {
    for (const j in split) {
      for (let k = 0; k <= lookahead; k += 1) {
        const refphrase = word;
        let bufphrase = split[j];
        for (let a = 1; a <= k; a += 1) {
          if (parseInt(j, 10) + a < split.length) {
            bufphrase += ` ${split[(parseInt(j, 10) + a).toString()]}`;
          }
        }
        if (referenceRules.length) {
          for (const l in referenceRules) {
            const refphraseMod = referenceRules[l](refphrase);
            if (inputRules.length) {
              for (const m in inputRules) {
                const bufphraseMod = inputRules[m](bufphrase);
                if (
                  levenshteinInThreshold(
                    threshold,
                    refphraseMod,
                    bufphraseMod
                  ) &&
                  !excepted(bufphraseMod)
                ) {
                  return {
                    matched: true,
                    reference: {
                      used: refphraseMod,
                      original: word,
                    },
                    input: {
                      used: bufphraseMod,
                      original: options.text,
                    },
                  };
                }
              }
            } else if (
              levenshteinInThreshold(threshold, refphraseMod, bufphrase) &&
              !excepted(bufphrase)
            ) {
              return {
                matched: true,
                reference: {
                  used: refphraseMod,
                  original: word,
                },
                input: {
                  used: bufphrase,
                  original: options.text,
                },
              };
            }
          }
        } else if (inputRules.length) {
          for (const l in inputRules) {
            const bufphraseMod = inputRules[l](bufphrase);
            if (
              levenshteinInThreshold(threshold, refphrase, bufphraseMod) &&
              !excepted(bufphraseMod)
            ) {
              return {
                matched: true,
                reference: {
                  used: refphrase,
                  original: word,
                },
                input: {
                  used: bufphraseMod,
                  original: options.text,
                },
              };
            }
          }
        } else if (
          levenshteinInThreshold(threshold, refphrase, bufphrase) &&
          !excepted(bufphrase)
        ) {
          return {
            matched: true,
            reference: {
              used: refphrase,
              original: word,
            },
            input: {
              used: bufphrase,
              original: options.text,
            },
          };
        }
      }
    }
  }

  return {
    matched: false,
    reference: {
      used: '',
      original: '',
    },
    input: {
      used: '',
      original: options.text,
    },
  };
}

import { levenshteinMatches, LevenshteinResult } from './levenshtein';
import { config } from './config_manager';

const replaceHyphens = (s: string): string => s.replace(/-/g, ' ');
const replaceUnderscores = (s: string): string => s.replace(/_/g, ' ');
const replaceSpaces = (s: string): string => s.replace(/ /g, '');
const removeWhitespace = (s: string): string => {
  let f = replaceHyphens(s);
  f = replaceUnderscores(f);
  f = replaceSpaces(f);
  return f;
};
const removeNonAlphanumeric = (s: string): string =>
  s.replace(/[^a-zA-Z0-9 -]/g, '');
const removeNonAlphabetic = (s: string): string => {
  let f = removeNonAlphanumeric(s);
  f = f.replace(/[\d-]/g, '');
  return f;
};

export interface WordFilterOptions {
  text: string;
  threshold?: number;
  lookahead?: number;
}

export function runWordFilter(
  inputOrOptions: string | WordFilterOptions
): LevenshteinResult {
  const threshold =
    typeof inputOrOptions === 'string' ? null : inputOrOptions.threshold;
  const lookahead =
    typeof inputOrOptions === 'string' ? null : inputOrOptions.lookahead;
  const input =
    typeof inputOrOptions === 'string'
      ? inputOrOptions.toLowerCase()
      : inputOrOptions.text.toLowerCase();

  const wfConfig = config.wordFilter();
  const thresholdToUse = wfConfig.useLevenshtein ? threshold : 0;

  return levenshteinMatches({
    filteredWords: wfConfig.words,
    text: input,
    threshold: thresholdToUse,
    lookahead,
    inputRules: [
      replaceHyphens,
      replaceUnderscores,
      replaceSpaces,
      removeWhitespace,
      removeNonAlphanumeric,
      removeNonAlphabetic,
    ],
  });
}

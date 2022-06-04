import { isString } from 'util';
import { Embedder } from '../util/embedder';
import { levenshteinMatches } from './levenshtein';
import * as log from './logging';
import { ConfigManager } from './config_manager';

const replaceHyphens = (s: string): string => s.replace(/-/g, ' ');
const replaceUnderscores = (s: string): string => s.replace(/_/g, ' ');
const replaceSpaces = (s: string): string => s.replace(/\ /g, '');
const removeWhitespace = (s: string): string => {
  s = replaceHyphens(s);
  s = replaceUnderscores(s);
  s = replaceSpaces(s);
  return s;
};
const removeNonAlphanumeric = (s: string): string =>
  s.replace(/[^a-zA-Z0-9 -]/g, '');
const removeNonAlphabetic = (s: string): string => {
  s = removeNonAlphanumeric(s);
  s = s.replace(/[\d-]/g, '');
  return s;
};

export async function wordFilterProcess(
  msg: any,
  threshold?: number,
  lookahead?: number
): Promise<void> {
  if (!isString(msg.content)) {
    return;
  }
  const wfConfig = new ConfigManager().wordFilter();
  threshold = wfConfig.use_levenshtein ? threshold : 0;
  const resp = levenshteinMatches(
    wfConfig.words,
    msg.content.toLowerCase(),
    threshold,
    lookahead,
    [],
    [
      replaceHyphens,
      replaceUnderscores,
      replaceSpaces,
      removeWhitespace,
      removeNonAlphanumeric,
      removeNonAlphabetic,
    ]
  );
  if (resp.matched) {
    log.debug(
      `Matched.\nReference:\n    Used: "${resp.reference.used}"\n    Original: "${resp.reference.original}"\nInput:\n    Used: "${resp.input.used}"\n    Original: "${resp.input.original}"`
    );

    if (wfConfig.reply === true) {
      const embedder = new Embedder(msg.author);
      const embed = embedder.embed(
        wfConfig.reply_title,
        wfConfig.reply_content
      );
      await msg.reply({ embeds: [embed] });
    }

    if (wfConfig.delete_trigger === true) {
      try {
        await msg.delete();
      } catch (e) {
        log.warn(
          msg.client,
          `Message that triggered the word filter couldn\'t be deleted: ${e}`
        );
      }
    }
  }
}

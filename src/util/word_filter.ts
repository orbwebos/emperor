import { EmperorEmbedder } from './emperor_embedder';
import { levenshteinMatches } from './levenshtein';
import { isString } from 'util';
import * as log from '../util/logging';
import { ConfigManager } from './config_manager';

const replaceHyphens = (s: string): string => s.replace(/-/g, ' ');
const replaceUnderscores = (s: string): string => s.replace(/_/g, ' ');
const replaceSpaces = (s: string): string => s.replace(/\ /g, '');
const removeWhitespace = (s: string): string => {
  s = replaceHyphens(s);
  s = replaceUnderscores(s);
  s = replaceSpaces(s);
  return s;
}

export async function wordFilterProcess(msg: any, threshold?: number, lookahead?: number): Promise<void> {
  if (!isString(msg.content)) {
    return;
  }
  const wfConfig = new ConfigManager().wordFilter();
  const resp = levenshteinMatches(wfConfig.words, msg.content.toLowerCase(), threshold, lookahead, [], [replaceHyphens, replaceUnderscores, replaceSpaces, removeWhitespace]);
  if (resp.matched) {
    log.debug(`Matched.\nReference:\n    Used: "${resp.reference.used}"\n    Original: "${resp.reference.original}"\nInput:\n    Used: "${resp.input.used}"\n    Original: "${resp.input.original}"`);
    if (wfConfig.reply === true) {
      const embedder = new EmperorEmbedder(msg.author);
      const embed = embedder.emperorEmbed(wfConfig.reply_title, wfConfig.reply_content);
      msg.reply({ embeds: [embed] });
    }
    if (wfConfig.delete_trigger === true) {
      try {
        await msg.delete();
      }
      catch(e) {
        log.warn(msg.client, `Message that triggered the word filter couldn\'t be deleted: ${e}`);
      }
    }
  }
}
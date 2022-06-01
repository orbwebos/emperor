import { Message, ReplyMessageOptions } from 'discord.js';
import { EmperorEmbedder } from '../emperor/embedder';
import { levenshteinMatches } from '../util/levenshtein';
import { ConfigManager } from '../util/config_manager';
import { truncateString } from '../util/string_utils';

const replaceHyphens = (s: string): string => s.replace(/-/g, ' ');
const replaceUnderscores = (s: string): string => s.replace(/_/g, ' ');
const replaceSpaces = (s: string): string => s.replace(/ /g, '');
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

export function analyzeFilterProcess(
  m: Message,
  threshold?: number,
  lookahead?: number
): Promise<Message<boolean>> {
  const wfConfig = new ConfigManager().wordFilter();
  threshold = wfConfig.use_levenshtein ? threshold : 0;
  const resp = levenshteinMatches(
    wfConfig.words,
    m.content.toLowerCase(),
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

  const matchedString = resp.matched
    ? truncateString(
        `✅ The message **triggered** the word filter.\n\n**Original input:**\n${truncateString(
          resp.input.original,
          450
        )}\n\n**Original reference:**\n${
          resp.reference.original
        }\n\n**——————**\n\n**Matched input:**\n${truncateString(
          resp.input.used,
          450
        )}\n\n**Matched reference:**\n${truncateString(
          resp.reference.used,
          450
        )}`,
        1850
      )
    : truncateString(
        `❌ The message **did not trigger** the word filter.\n\n**Message:**\n${resp.input.original}`,
        1850
      );

  const embedder = new EmperorEmbedder(m.author);
  const embed = embedder.emperorEmbed(
    'Filter analysis is complete',
    matchedString
  );
  return m.reply({ embeds: [embed] } as ReplyMessageOptions);
}

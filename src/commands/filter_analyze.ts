import { Message } from 'discord.js';
import { Command, Replier } from 'imperial-discord';
import { dotPrefixed } from '../util/dot_prefixed';
import { truncateString } from '../util/string_utils';
import { runWordFilter } from '../util/word_filter';
import { config } from '../util/config_manager';
import { getProvidedText } from '../util/content';

export const filterAnalysisTriggered = (message: Message) =>
  dotPrefixed(
    message.content,
    'filter-analyze',
    'filteranalyze',
    'filter_analyze',
    'analyze-filter',
    'analyzefilter',
    'analyze_filter',
    'filter-analysis',
    'filteranalysis',
    'filter_analysis'
  );

export class FilterAnalyzeCommand extends Command {
  public constructor() {
    super({ description: 'Runs filter analysis on a replied message.' });
  }

  public registerMessageCallback(message: Message) {
    return filterAnalysisTriggered(message);
  }

  public async messageExecute(message: Message) {
    const text = await getProvidedText(message);

    if (!text) {
      return message.reply(
        'You need to provide text to analyze or reply to a message in order to run the filter analysis.'
      );
    }

    const wfConfig = config.wordFilter();

    const result = runWordFilter({
      text,
      threshold: wfConfig.levenshteinThreshold,
      lookahead: wfConfig.levenshteinLookahead,
    });
    const filterAnalysis = result.matched
      ? truncateString(
          `✅ The message **triggered** the word filter.\n\n**Original input:**\n${truncateString(
            result.input.original,
            450
          )}\n\n**Original reference:**\n${
            result.reference.original
          }\n\n**——————**\n\n**Matched input:**\n${truncateString(
            result.input.used,
            450
          )}\n\n**Matched reference:**\n${truncateString(
            result.reference.used,
            450
          )}`,
          1850
        )
      : truncateString(
          `❌ The message **did not trigger** the word filter.\n\n**Message:**\n${result.input.original}`,
          1850
        );

    return new Replier(message).embedReply(
      'Filter analysis is complete',
      filterAnalysis
    );
  }
}

import { Message } from 'discord.js';
import { Command, Replier } from 'imperial-discord';
import { runWordFilter } from '../util/word_filter';
import { filterAnalysisTriggered } from './filter_analyze';
import { config } from '../util/config_manager';

export class WordFilterActionCommand extends Command {
  public constructor() {
    super({
      description:
        'This action is triggered by using any words in the internal filtered list.',
    });
  }

  public registerMessageTrigger(message: Message) {
    if (filterAnalysisTriggered(message)) {
      return false;
    }

    if (
      config.general.wordFilterGuildsWhitelist.includes(message.guildId) ===
        true &&
      config.general.wordFilterChannelsBlacklist.includes(message.channelId) ===
        false
    ) {
      const wfConfig = config.wordFilter();

      const result = runWordFilter({
        text: message.content,
        threshold: wfConfig.levenshteinThreshold,
        lookahead: wfConfig.levenshteinLookahead,
      });

      if (result.matched) {
        return true;
      }
    }

    return false;
  }

  public async messageExecute(message: Message) {
    const wfConfig = config.wordFilter();

    if (wfConfig.reply === true) {
      await new Replier(message).embedReply(
        wfConfig.replyTitle,
        wfConfig.replyContent
      );
    }

    if (wfConfig.deleteTrigger === true) {
      try {
        await message.delete();
      } catch (e) {
        this.logger.warn(
          `Message that triggered the word filter couldn't be deleted: ${e}`
        );
      }
    }
  }
}

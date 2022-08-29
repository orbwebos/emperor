import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { getRepliedMessage } from '../util/get_replied_message';
import { config } from '../util/config_manager';

export class EmojiReactionActionCommand extends Command {
  public constructor() {
    super({ description: 'Ratios.' });
  }

  public registerMessageCallback(message: Message) {
    if (message.reference === null) {
      return false;
    }

    if (
      message.content
        .toLowerCase()
        .includes(config.general.emojiReactionTriggerWord) &&
      config.general.emojiReaction === true &&
      config.general.emojiReactionGuildsWhitelist.includes(message.guildId) ===
        true
    ) {
      return true;
    }

    return false;
  }

  public async messageExecute(message: Message) {
    // eslint-disable-next-line no-restricted-syntax
    for (const emoji of config.general.emojiReactionResolvables) {
      // eslint-disable-next-line no-await-in-loop
      await (await getRepliedMessage(message)).react(emoji);
      // eslint-disable-next-line no-await-in-loop
      await message.react(emoji);
    }
  }
}

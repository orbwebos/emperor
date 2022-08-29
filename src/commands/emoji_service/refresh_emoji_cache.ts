import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { dotPrefixed } from '../../util/dot_prefixed';
import { isOwnerId } from '../../util/owner';

export class RefreshEmojiCacheCommand extends Command {
  public constructor() {
    super({
      description:
        'Refreshes the emoji cache. It automatically happens every 30 minutes.',
    });
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(message.content, 'refresh-emoji-cache');
  }

  public async messageExecute(message: Message) {
    if (!isOwnerId(message.author.id)) {
      return message.reply(
        "Sorry, you don't have permission to do that. You can ask this bot's owner to refresh the cache, or wait until it happens automatically (every 30 minutes.)"
      );
    }

    await message.client.emojiStore.refresh();
    return message.reply('The emoji cache has been refreshed.');
  }
}

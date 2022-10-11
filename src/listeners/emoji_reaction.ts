import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { getRepliedMessage } from '../lib/content';

const { config } = container;

@ApplyOptions<Listener.Options>({
  event: 'messageCreate',
})
export class EmojiReactionAction extends Listener {
  private triggered(message: Message) {
    return (
      message.reference !== null &&
      message.content
        .toLowerCase()
        .includes(config.general.emojiReactionTriggerWord) &&
      config.general.emojiReaction === true &&
      config.general.emojiReactionGuildsWhitelist.includes(message.guildId) ===
        true
    );
  }

  public async run(message: Message) {
    if (!this.triggered(message)) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const emoji of config.general.emojiReactionResolvables) {
      // eslint-disable-next-line no-await-in-loop
      await (await getRepliedMessage(message)).react(emoji);
      // eslint-disable-next-line no-await-in-loop
      await message.react(emoji);
    }
  }
}

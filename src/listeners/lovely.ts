import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { includesAny, isAnyOf } from '../lib/util';

@ApplyOptions<Listener.Options>({
  event: 'messageCreate',
})
export class LovelyAction extends Listener {
  private triggered(message: Message) {
    return (
      includesAny(message.content.toLowerCase(), 'lovely', 'beloved') &&
      isAnyOf(
        message.guildId,
        ...this.container.config.general.lovelyActionGuilds
      )
    );
  }

  public async run(message: Message) {
    if (!this.triggered(message)) {
      return;
    }

    message.react(this.container.config.general.lovelyActionEmoji);
  }
}

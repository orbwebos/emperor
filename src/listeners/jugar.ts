import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { isAnyOf } from '../lib/util';

@ApplyOptions<Listener.Options>({
  event: 'messageCreate',
})
export class JugarAction extends Listener {
  private triggered(message: Message) {
    const jugarRegex = /quien \w+ jugar/gi;

    return (
      isAnyOf(
        message.guildId,
        ...this.container.config.general.jugarActionGuilds
      ) && jugarRegex.test(message.content)
    );
  }

  public async run(message: Message) {
    if (!this.triggered(message)) {
      return;
    }

    message.reply(this.container.config.general.jugarActionEmoji);
  }
}

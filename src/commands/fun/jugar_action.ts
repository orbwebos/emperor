import { Message } from 'discord.js';
import { Command } from 'imperial-discord';

export class JugarActionCommand extends Command {
  public constructor() {
    super({ description: 'Private server action.' });
  }

  public registerMessageTrigger(message: Message) {
    const jugarRegex = /quien \w+ jugar/gi;

    if (
      message.guildId === '782023593353412649' &&
      jugarRegex.test(message.content)
    ) {
      return true;
    }

    return false;
  }

  public async messageExecute(message: Message) {
    return message.reply(
      'https://tenor.com/view/monkey-clown-laugh-wanted-gif-25134166'
    );
  }
}

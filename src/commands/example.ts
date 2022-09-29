import { Message } from 'discord.js';
import { Command } from 'imperial-discord';

export class ExampleCommand extends Command {
  public constructor() {
    super({ description: 'An example Imperial command.' });
  }

  public messageExecute(message: Message) {
    return message.reply('Example command.');
  }
}

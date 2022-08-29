import { Message } from 'discord.js';
import { Command } from 'imperial-discord';

export class LovelyActionCommand extends Command {
  public constructor() {
    super({ description: 'Private server action.' });
  }

  public registerMessageCallback(message: Message) {
    const lcc = message.content.toLowerCase();
    if (
      (lcc.includes('lovely') || lcc.includes('beloved')) &&
      (message.guildId === '308422022650789888' ||
        message.guildId === '906631270048624661')
    ) {
      return true;
    }

    return false;
  }

  public async messageExecute(message: Message) {
    return message.react('335133804656197632');
  }
}

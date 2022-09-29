import { Message } from 'discord.js';
import { Command, ownerExclusive } from 'imperial-discord';

export class OwnerCommand extends Command {
  public constructor() {
    super({ preconditions: [ownerExclusive] });
  }

  public async messageExecute(message: Message) {
    return message.reply("You're the owner.");
  }
}

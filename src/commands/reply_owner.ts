import { Message } from 'discord.js';
import { Command, ownerExclusive, mustBeReply } from 'imperial-discord';

export class ReplyOwnerCommand extends Command {
  public constructor() {
    super({ preconditions: [ownerExclusive, mustBeReply] });
  }

  public async messageExecute(message: Message) {
    return message.reply("You're the owner and you replied.");
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  description: "Tells you that you're the owner.",
  preconditions: ['OwnerExclusive'],
})
export class OwnerCommand extends Command {
  public messageRun(message: Message) {
    return message.reply('You are an owner.');
  }
}

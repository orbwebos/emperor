import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { Message } from 'discord.js';
import {
  isInEmojiBlacklist,
  removeFromEmojiBlacklist,
} from '../../lib/emoji_blacklist';

@ApplyOptions<Command.Options>({
  description: `Opts you into ${container.config.bot.possessiveName} emoji service.`,
})
export class EmojisOnCommand extends Command {
  public async messageRun(message: Message) {
    const { id } = message.author;

    if (!(await isInEmojiBlacklist(id))) {
      return message.reply(
        "It seems like Emperor's emoji service was already active for you."
      );
    }

    await removeFromEmojiBlacklist(id);

    return message.reply("You have opted into Emperor's emoji service.");
  }
}

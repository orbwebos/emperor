import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { Message } from 'discord.js';
import {
  addToEmojiBlacklist,
  isInEmojiBlacklist,
} from '../../lib/emoji_blacklist';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('emojis off'),
  description: `Opts you out of ${container.config.bot.possessiveName} emoji service.`,
})
export class EmojisOffCommand extends Command {
  public async messageRun(message: Message) {
    const { id } = message.author;

    if (await isInEmojiBlacklist(id)) {
      return message.reply(
        "It seems like you have already opted out of Emperor's emoji service."
      );
    }

    await addToEmojiBlacklist(id);

    return message.reply("You have opted out of Emperor's emoji service.");
  }
}

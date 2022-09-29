import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { config } from '../../util/config_manager';
import {
  addToEmojiBlacklist,
  isInEmojiBlacklist,
} from '../../util/emoji_blacklist';

export class EmojisOffCommand extends Command {
  public constructor() {
    super({
      description: `Opts you out of ${config.bot.possessiveName} emoji service.`,
    });
  }

  public async messageExecute(message: Message) {
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

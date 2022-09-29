import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { config } from '../../util/config_manager';
import {
  isInEmojiBlacklist,
  removeFromEmojiBlacklist,
} from '../../util/emoji_blacklist';

export class EmojisOnCommand extends Command {
  public constructor() {
    super({
      description: `Opts you into ${config.bot.possessiveName} emoji service.`,
    });
  }

  public async messageExecute(message: Message) {
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

import { Message } from 'discord.js';
import { existsSync } from 'fs';
import { Command } from 'imperial-discord';
import rimraf from 'rimraf';
import { ensureDirectory } from '../../util/directory';
import { dotPrefixed } from '../../util/dot_prefixed';
import { resolvePathFromSource } from '../../util/resolve_path';
import { config } from '../../util/config_manager';

export class EmojisOnCommand extends Command {
  public constructor() {
    super({
      description: `Opts you into ${config.bot.possessiveName} emoji service.`,
    });
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(message.content, 'emojis-on', 'emojis_on', 'emojison');
  }

  public async messageExecute(message: Message) {
    ensureDirectory(resolvePathFromSource(`../data/emoji_blacklist`));

    if (
      !existsSync(
        resolvePathFromSource(`../data/emoji_blacklist/${message.author.id}`)
      )
    ) {
      return message.reply(
        "It seems like Emperor's emoji service was already active for you."
      );
    }

    return rimraf(
      resolvePathFromSource(`../data/emoji_blacklist/${message.author.id}`),
      (e) => {
        if (e) {
          this.logger.error(e);
          message.reply('There has been an unexpected error.');
        } else {
          message.reply("You have opted into Emperor's emoji service.");
        }
      }
    );
  }
}

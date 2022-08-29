import { Message } from 'discord.js';
import { writeFileSync } from 'fs';
import { Command } from 'imperial-discord';
import { ensureDirectory } from '../../util/directory';
import { dotPrefixed } from '../../util/dot_prefixed';
import { resolvePathFromSource } from '../../util/resolve_path';
import { config } from '../../util/config_manager';

export class EmojisOffCommand extends Command {
  public constructor() {
    super({
      description: `Opts you out of ${config.bot.possessiveName} emoji service.`,
    });
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(
      message.content,
      'emojis-off',
      'emojis_off',
      'emojisoff'
    );
  }

  public messageExecute(message: Message) {
    ensureDirectory(resolvePathFromSource(`../data/emoji_blacklist`));

    writeFileSync(
      resolvePathFromSource(`../data/emoji_blacklist/${message.author.id}`),
      ''
    );

    return message.reply("You have opted out of Emperor's emoji service.");
  }
}

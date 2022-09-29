import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { config } from '../util/config_manager';

export class MediaCheckActionCommand extends Command {
  public constructor() {
    super({
      description:
        'If active, this action checks for `media.discordapp.net` video links.',
    });
  }

  public registerMessageTrigger(message: Message) {
    if (
      config.general.mediaChecker === true &&
      config.general.mediaCheckerGuildsWhitelist.includes(message.guildId) ===
        true &&
      message.content.startsWith('https://media.discordapp.net')
    ) {
      return true;
    }

    return false;
  }

  public async messageExecute(message: Message) {
    const split = message.content.split(' ');

    const link = split[0];
    if (
      link.endsWith('.mp4') ||
      link.endsWith('.mov') ||
      link.endsWith('.mov') ||
      link.endsWith('.webm')
    ) {
      const linkReplaced = link.replace(
        'media.discordapp.net',
        'cdn.discordapp.com'
      );
      message.reply(
        `You seem to have posted a \`media.discordapp.net\` video. Please use \`cdn.discordapp.com\` in the future.\n${linkReplaced}`
      );
    }
  }
}

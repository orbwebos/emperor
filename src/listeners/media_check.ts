import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: 'messageCreate',
})
export class MediaCheckAction extends Listener {
  private triggered(message: Message) {
    return (
      this.container.config.general.mediaChecker === true &&
      this.container.config.general.mediaCheckerGuildsWhitelist.includes(
        message.guildId
      ) === true &&
      message.content.startsWith('https://media.discordapp.net')
    );
  }

  public async run(message: Message) {
    if (!this.triggered(message)) {
      return;
    }

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

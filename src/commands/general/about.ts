import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message, EmbedBuilder } from 'discord.js';

function milisecondsToDhms(time: number) {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  const daysString = `${days} day${days === 1 ? '' : 's'}`;
  const hoursString = `${hours} hour${hours === 1 ? '' : 's'}`;
  const minutesString = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const secondsString = `${seconds} second${seconds === 1 ? '' : 's'}`;

  const timeString = [daysString, hoursString, minutesString, secondsString]
    .filter((string) => string.startsWith('0') === false)
    .join(', ');

  return timeString;
}

@ApplyOptions<Command.Options>({
  description: 'Displays information about the bot.',
})
export class AboutCommand extends Command {
  public async messageRun(message: Message) {
    const { config } = this.container;

    const guilds = this.container.client.guilds.cache.size;
    const formattedUptime = milisecondsToDhms(this.container.client.uptime);

    const embed = new EmbedBuilder()
      .setColor('#7850bd')
      .setThumbnail(this.container.client.user.displayAvatarURL())
      .setTitle(`About ${config.bot.name}`)
      .addFields(
        { name: 'Version', value: config.bot.version, inline: true },
        {
          name: 'Servers',
          value: guilds === 1 ? `${guilds} server` : `${guilds} servers`,
          inline: true,
        },
        {
          name: 'Uptime',
          value: formattedUptime,
          inline: true,
        }
      );

    message.reply({ embeds: [embed] });
  }
}

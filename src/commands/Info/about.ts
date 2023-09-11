import { CpuInfo, cpus } from 'os';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message, EmbedBuilder } from 'discord.js';
import { roundNumber } from '@sapphire/utilities';
import { registerSwitch } from '../../lib/util';
import { replyEmbed, silentTrackReplyEmbed } from '../../lib/reply';
import { defaultEmperorEmbed } from '../../lib/embeds';

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
  description: 'Displays information about Emperor',
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129281546885533757'],
        },
        production: {
          idHints: ['1129290677189083160'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return replyEmbed(interaction, this.aboutEmbed());
  }

  public async messageRun(message: Message) {
    return silentTrackReplyEmbed(message, this.aboutEmbed());
  }

  private aboutEmbed(): EmbedBuilder {
    const { client, config } = this.container;

    const guilds = client.guilds.cache.size;
    const formattedUptime = milisecondsToDhms(client.uptime);

    const usage = this.usageStatistics();

    return defaultEmperorEmbed()
      .setThumbnail(client.user.displayAvatarURL())
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
        },
        {
          name: 'Library',
          value: 'discord.js',
          inline: true,
        },
        {
          name: 'GitHub',
          value: '[orbwebos/emperor](https://github.com/orbwebos/emperor)',
          inline: true,
        },
        {
          name: 'Resources',
          value: `**CPU**: ${
            usage.cpuLoad
          }\n**Memory usage**: ${UserCommand.formatMemoryUsage(
            usage.ramTotal,
            usage.ramUsed
          )}%`,
          inline: true,
        }
      );
  }

  private usageStatistics(): {
    cpuLoad: string;
    ramTotal: number;
    ramUsed: number;
  } {
    const usage = process.memoryUsage();
    return {
      cpuLoad: cpus().map(UserCommand.formatCpuInfo.bind(null)).join(' | '),
      ramTotal: usage.heapTotal / 1048576,
      ramUsed: usage.heapUsed / 1048576,
    };
  }

  private static formatMemoryUsage(total: number, used: number): string {
    return ((used / total) * 100).toFixed(2);
  }

  private static formatCpuInfo({ times }: CpuInfo): string {
    return `${
      roundNumber(
        ((times.user + times.nice + times.sys + times.irq) / times.idle) * 1000
      ) / 100
    }%`;
  }
}

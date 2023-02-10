import { container } from '@sapphire/framework';
import { ColorResolvable, EmbedBuilder } from 'discord.js';

export interface BrandedEmbedOptions {
  title: string;
  body: string;
  userName: string;
  avatarUrl: string;
  color?: ColorResolvable;
}

export class BrandedEmbed {
  public construct(options: BrandedEmbedOptions): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(options.color ?? '#7850bd')
      .setTitle(options.title)
      .setAuthor({
        name: !options.userName.endsWith('#0000')
          ? options.userName
          : options.userName.slice(0, -5),
        iconURL: options.avatarUrl,
      })
      .setDescription(options.body)
      .setTimestamp()
      .setFooter({
        text: `${container.config.bot.name} v${container.config.bot.version}`,
      });
  }
}

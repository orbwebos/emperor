import { ColorResolvable, User, MessageEmbed } from 'discord.js';
import { ConfigManager } from '../util/config_manager';

const config = new ConfigManager();

export class EmperorEmbedder {
  public username: string;
  public userAvatarUrl: string;

  constructor(user: User | string, avatarUser?: string) {
    if (!avatarUser && !(user instanceof User)) {
      throw new Error(`No avatar URL received for ${config.bot.name} embedder`);
    }

    this.username = user instanceof User ? user.tag : user;

    this.userAvatarUrl =
      avatarUser || (user as User).displayAvatarURL({ dynamic: true });
  }

  public emperorEmbed(
    title: string,
    text: string,
    color: ColorResolvable = '#7850bd'
  ): MessageEmbed {
    return new MessageEmbed()
      .setColor(color)
      .setTitle(title)
      .setAuthor({
        name: !this.username.endsWith('#0000')
          ? this.username
          : this.username.slice(0, -5),
        iconURL: this.userAvatarUrl,
      })
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: `${config.bot.name} v${config.bot.version}` });
  }

  public paginatedEmperorEmbed(
    title: string,
    text: string,
    currentPage: number,
    totalPages: number,
    color: ColorResolvable = '#7850bd'
  ): MessageEmbed {
    return new MessageEmbed()
      .setColor(color)
      .setTitle(title)
      .setAuthor({
        name: !this.username.endsWith('#0000')
          ? this.username
          : this.username.slice(0, -5),
        iconURL: this.userAvatarUrl,
      })
      .setDescription(text)
      .setTimestamp()
      .setFooter({
        text: `Page ${currentPage}/${totalPages} | ${config.bot.name} v${config.bot.version}`,
      });
  }
}

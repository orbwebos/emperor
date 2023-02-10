import { ColorResolvable, User, EmbedBuilder } from 'discord.js';
import { ConfigManager } from './config_manager';

const config = new ConfigManager();

export interface EmbedOptions {
  title?: string;
  body?: string;
  color?: ColorResolvable;
}

export class Embedder {
  public username: string;
  public userAvatarUrl: string;

  constructor(user: User | string, avatarUser?: string) {
    if (!avatarUser && !(user instanceof User)) {
      throw new Error(`No avatar URL received for ${config.bot.name} embedder`);
    }

    this.username = user instanceof User ? user.tag : user;

    this.userAvatarUrl = avatarUser || (user as User).displayAvatarURL();
  }

  public embed(options: EmbedOptions): EmbedBuilder {
    const color = options.color ?? '#7850bd';

    let embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({
        name: !this.username.endsWith('#0000')
          ? this.username
          : this.username.slice(0, -5),
        iconURL: this.userAvatarUrl,
      })
      .setTimestamp()
      .setFooter({ text: `${config.bot.name} v${config.bot.version}` });

    embed = options.title ? embed.setTitle(options.title) : embed;
    return options.body ? embed.setDescription(options.body) : embed;
  }
}

import { ColorResolvable, User, EmbedBuilder } from 'discord.js';
import { ConfigManager } from './ConfigManager';
import { userName } from './util';

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

    this.username = user instanceof User ? userName(user) : user;

    this.userAvatarUrl = avatarUser || (user as User).displayAvatarURL();
  }

  public embed(options: EmbedOptions): EmbedBuilder {
    const color = options.color ?? '#7850bd';

    let embed = new EmbedBuilder().setColor(color).setAuthor({
      name: this.username,
      iconURL: this.userAvatarUrl,
    });

    embed = options.title ? embed.setTitle(options.title) : embed;
    return options.body ? embed.setDescription(options.body) : embed;
  }
}

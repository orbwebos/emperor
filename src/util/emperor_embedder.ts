import * as djs from 'discord.js';
import { ConfigManager } from './config_manager'; const config = new ConfigManager();

export class EmperorEmbedder {
  username: string;
  userAvatarUrl: string;

  constructor(user: djs.User | string, avatarUser?: string) {
    if (typeof user === 'string') {
      this.username = user;
      if (!avatarUser) {
        throw new Error(`No avatar URL received for ${config.bot.name} embedder`);
      }
      this.userAvatarUrl = avatarUser;
    }
    else {
      this.username = user.tag;
      this.userAvatarUrl = user.displayAvatarURL({ dynamic: true});
    }
  }

  emperorEmbed(title: string, text: string, color?: djs.ColorResolvable): djs.MessageEmbed {
    if (!color) {
      color = '#7850bd';
    }

    const embed = new djs.MessageEmbed()
      .setColor(color)
      .setTitle(title)
      .setAuthor(this.username, this.userAvatarUrl)
      .setDescription(text)
      .setTimestamp()
      .setFooter(`${config.bot.name} v${config.bot.version}`);

    return embed;
  }

  paginatedEmperorEmbed(title: string, text: string, currentPage: number, totalPages: number, color?: djs.ColorResolvable): djs.MessageEmbed {
    if (!color) {
      color = '#7850bd';
    }

    const embed = new djs.MessageEmbed()
      .setColor(color)
      .setTitle(title)
      .setAuthor(this.username, this.userAvatarUrl)
      .setDescription(text)
      .setTimestamp()
      .setFooter(`Page ${currentPage}/${totalPages} | ${config.bot.name} v${config.bot.version}`);

    return embed;
  }
}

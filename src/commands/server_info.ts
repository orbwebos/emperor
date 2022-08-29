import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { ConfigManager } from '../util/config_manager';
import { dotPrefixed } from '../util/dot_prefixed';

export class ServerInfoCommand extends Command {
  public constructor() {
    super({ description: 'Display information about this server.' });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
      .setName('server-info')
      .setDescription('Display information about this server.')
      .addBooleanOption((option) =>
        option
          .setName('invisible')
          .setDescription(
            `If true, only you will see ${
              new ConfigManager().bot.name_possessive
            } response. Default: false.`
          )
      );
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(
      message.content,
      'server-info',
      'server_info',
      'serverinfo',
      'svinfo'
    );
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      `**Server name:** ${interaction.guild.name}\n` +
        `**Total members:** ${interaction.guild.memberCount}\n` +
        `**Server was created in:** ${interaction.guild.createdAt}\n`,
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  public messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      `**Server name:** ${message.guild.name}\n` +
        `**Total members:** ${message.guild.memberCount}\n` +
        `**Server was created in:** ${message.guild.createdAt}\n`
    );
  }
}

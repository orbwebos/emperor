import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { ConfigManager } from '../util/config_manager';
import { dotPrefixed } from '../util/dot_prefixed';

export class UserInfoCommand extends Command {
  public constructor() {
    super({ description: 'Display information about yourself.' });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
      .setName('user-info')
      .setDescription('Display information about yourself.')
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
      'user-info',
      'user_info',
      'userinfo',
      'usrinfo'
    );
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      `**Your username:** ${interaction.user.username}\n**Your ID:** ${interaction.user.id}`,
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  public messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      `**Your username:** ${message.author.username}\n**Your ID:** ${message.author.id}`
    );
  }
}

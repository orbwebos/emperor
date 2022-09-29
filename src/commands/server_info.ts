import { ChatInputCommandInteraction, Message } from 'discord.js';
import {
  Command,
  EmbedTitle,
  Replier,
  variantsMessageTrigger,
} from 'imperial-discord';
import { ConfigManager } from '../util/config_manager';
import { registerOptions } from '../util/registration';

export class ServerInfoCommand extends Command {
  public constructor() {
    super({
      description: 'Display information about this server.',
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
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
        )
    );
  }

  public registerMessageTrigger(message: Message) {
    return variantsMessageTrigger(message.content, 'server-info', 'sv-info');
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

import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  GuildMember,
  Message,
} from 'discord.js';
import {
  BrandedEmbed,
  Command,
  EmbedTitle,
  Replier,
  variantsMessageTrigger,
} from 'imperial-discord';
import { ConfigManager } from '../util/config_manager';
import { registerOptions } from '../util/registration';

export class UserInfoCommand extends Command {
  public constructor() {
    super({
      description: 'Display information about yourself.',
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
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
        )
    );

    this.registerContextMenuCommand((builder) =>
      builder.setName('User Information').setType(ApplicationCommandType.User)
    );
  }

  public registerMessageTrigger(message: Message) {
    return variantsMessageTrigger(message.content, 'user-info', 'usr-info');
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      `**Your username:** ${interaction.user.username}\n**Your ID:** ${interaction.user.id}`,
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  // TODO: remove this somehow. look at best solution
  // eslint-disable-next-line consistent-return
  public contextMenuExecute(interaction: ContextMenuCommandInteraction) {
    if (
      interaction.isUserContextMenuCommand() &&
      interaction.targetMember instanceof GuildMember
    ) {
      return interaction.reply({
        embeds: [
          new BrandedEmbed(this.client).construct({
            title: new EmbedTitle(this).response,
            body: `**Your username:** ${interaction.targetMember.displayName}\n**Your ID:** ${interaction.targetMember.id}`,
            userName: interaction.targetMember.id,
            avatarUrl: interaction.targetMember.displayAvatarURL(),
          }),
        ],
      });
    }
  }

  public messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      `**Your username:** ${message.author.username}\n**Your ID:** ${message.author.id}`
    );
  }
}

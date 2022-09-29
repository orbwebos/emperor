import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  GuildMember,
} from 'discord.js';
import { Command } from 'imperial-discord';
import { registerOptions } from '../util/registration';

export class AvatarCommand extends Command {
  public constructor() {
    super({
      description:
        'Get the avatar URL of the selected user, or your own avatar.',
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('avatar')
        .setDescription(
          'Get the avatar URL of the selected user, or your own avatar.'
        )
        .addUserOption((option) =>
          option.setName('target').setDescription("The user's avatar to show")
        )
    );

    this.registerContextMenuCommand((builder) =>
      builder.setName('avatar').setType(ApplicationCommandType.User)
    );
  }

  // TODO: remove this somehow. look at best solution
  // eslint-disable-next-line consistent-return
  public async contextMenuExecute(interaction: ContextMenuCommandInteraction) {
    if (
      interaction.isUserContextMenuCommand() &&
      interaction.targetMember instanceof GuildMember
    ) {
      return interaction.reply(
        `${
          interaction.targetMember.displayName
        }'s avatar: ${interaction.targetMember.displayAvatarURL({
          extension: 'png',
          size: 1024,
        })}`
      );
    }
  }

  public async chatInputExecute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('target');

    if (user) {
      return interaction.reply(
        `${user.username}'s avatar: ${user.displayAvatarURL({
          extension: 'png',
          size: 1024,
        })}`
      );
    }

    return interaction.reply(
      `Your avatar: ${interaction.user.displayAvatarURL({
        extension: 'png',
        size: 1024,
      })}`
    );
  }
}

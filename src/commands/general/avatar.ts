import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Get the avatar URL of the selected user, or your own avatar.',
})
export class AvatarCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('avatar')
          .setDescription(
            'Get the avatar URL of the selected user, or your own avatar.'
          )
          .addUserOption((option) =>
            option.setName('target').setDescription("The user's avatar to show")
          ),
      registerSwitch({
        development: {
          guildIds: ['906631270048624661'],
          idHints: ['1029597608773156904'],
        },
        production: { idHints: ['1029606355654414348'] },
      })
    );

    registry.registerContextMenuCommand(
      {
        name: 'Guild avatar',
        type: 'USER',
      },
      registerSwitch({
        development: {
          guildIds: ['906631270048624661'],
          idHints: ['1029597611096817716'],
        },
        production: { idHints: ['1029606356916895804'] },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const user = interaction.options.getUser('target');

    if (user) {
      return interaction.reply(
        `${user.username}'s avatar: ${user.displayAvatarURL({
          size: 1024,
        })}`
      );
    }

    return interaction.reply(
      `Your avatar: ${interaction.user.displayAvatarURL({
        size: 1024,
      })}`
    );
  }

  // TODO: remove this somehow. look at best solution
  // eslint-disable-next-line consistent-return
  public async contextMenuRun(interaction: Command.ContextMenuInteraction) {
    if (
      interaction.isUserContextMenu() &&
      interaction.targetMember instanceof GuildMember
    ) {
      return interaction.reply(
        `${
          interaction.targetMember.displayName
        }'s avatar: ${interaction.targetMember.displayAvatarURL({
          size: 1024,
        })}`
      );
    }
  }
}

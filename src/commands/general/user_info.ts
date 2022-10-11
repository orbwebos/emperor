import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { GuildMember, Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';
import { invisibleOption } from '../../lib/invisible_option';

@ApplyOptions<Command.Options>({
  description: 'Display information about yourself.',
})
export class UserInfoCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      invisibleOption(
        builder.setName('user-info').setDescription(this.description)
      )
    );

    registry.registerContextMenuCommand({
      name: 'User Information',
      type: 'USER',
    });
  }

  private getText(username: string, id: string) {
    return `**Your username:** ${username}\n**Your ID:** ${id}`;
  }

  public chatInputRun(interaction: Command.ChatInputInteraction) {
    const helper = new CommandHelper(interaction, this);

    return interaction.reply({
      embeds: [
        helper.makeResponseEmbed(
          this.getText(interaction.user.username, interaction.user.id)
        ),
      ],
      ephemeral: helper.isInvisible(),
    });
  }

  // TODO: remove this somehow. look at best solution
  // eslint-disable-next-line consistent-return
  public contextMenuRun(interaction: Command.ContextMenuInteraction) {
    if (
      interaction.isUserContextMenu() &&
      interaction.targetMember instanceof GuildMember
    ) {
      const helper = new CommandHelper(interaction, this);

      return interaction.reply({
        embeds: [
          helper.makeResponseEmbed(
            this.getText(
              interaction.targetMember.displayName,
              interaction.targetMember.id
            )
          ),
        ],
      });
    }
  }

  public messageRun(message: Message) {
    const helper = new CommandHelper(message, this);

    return message.reply({
      embeds: [
        helper.makeResponseEmbed(
          this.getText(message.author.username, message.author.id)
        ),
      ],
    });
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { GuildMember, Message, ApplicationCommandType } from 'discord.js';
import { CommandHelper } from '../../lib/CommandHelper';
import { registerSwitch } from '../../lib/util';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('user information', 'user info', 'usr info'),
  description: 'Display information about yourself',
})
export class UserInfoCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235232718061668'],
        },
        production: {
          idHints: ['1129238361467531284'],
        },
      })
    );

    registry.registerContextMenuCommand(
      (builder) =>
        builder
          .setName('User Information')
          .setType(ApplicationCommandType.User),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235233909244077'],
        },
        production: {
          idHints: ['1129238362688061470'],
        },
      })
    );
  }

  private getText(username: string, id: string) {
    return `**Your username:** ${username}\n**Your ID:** ${id}`;
  }

  public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const helper = new CommandHelper(interaction, this);

    return interaction.reply({
      embeds: [
        helper.makeResponseEmbed(
          this.getText(interaction.user.username, interaction.user.id)
        ),
      ],
    });
  }

  // TODO: remove this somehow. look at best solution
  // eslint-disable-next-line consistent-return
  public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    if (
      interaction.isUserContextMenuCommand() &&
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

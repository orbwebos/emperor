import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Guild, Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';
import { invisibleOption } from '../../lib/invisible_option';

@ApplyOptions<Command.Options>({
  description: 'Display information about this server.',
})
export class ServerInfoCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      invisibleOption(
        builder
          .setName('server-info')
          .setDescription('Display information about this server.')
      )
    );
  }

  private getText(guild: Guild) {
    return (
      `**Server name:** ${guild.name}\n` +
      `**Total members:** ${guild.memberCount}\n` +
      `**Server was created in:** ${guild.createdAt}\n`
    );
  }

  public chatInputRun(interaction: Command.ChatInputInteraction) {
    const helper = new CommandHelper(interaction, this);

    return interaction.reply({
      embeds: [helper.makeResponseEmbed(this.getText(interaction.guild))],
      ephemeral: helper.isInvisible(),
    });
  }

  public messageRun(message: Message) {
    const helper = new CommandHelper(message, this);

    return message.reply({
      embeds: [helper.makeResponseEmbed(this.getText(message.guild))],
    });
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Guild, Message } from 'discord.js';
import { CommandHelper } from '../../lib/CommandHelper';
import { registerSwitch } from '../../lib/util';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants(
    'server information',
    'server info',
    'srv info',
    'guild information',
    'guild info'
  ),
  description: 'Display information about this server',
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription('Display information about this server'),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235321322733588'],
        },
        production: {
          idHints: ['1129238449589866576'],
        },
      })
    );
  }

  private getText(guild: Guild) {
    return (
      `**Server name:** ${guild.name}\n` +
      `**Total members:** ${guild.memberCount}\n` +
      `**Server was created in:** ${guild.createdAt}\n`
    );
  }

  public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const helper = new CommandHelper(interaction, this);

    return interaction.reply({
      embeds: [helper.makeResponseEmbed(this.getText(interaction.guild))],
    });
  }

  public messageRun(message: Message) {
    const helper = new CommandHelper(message, this);

    return message.reply({
      embeds: [helper.makeResponseEmbed(this.getText(message.guild))],
    });
  }
}

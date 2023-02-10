import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { Message } from 'discord.js';
import { invisibleOption } from '../../lib/invisible_option';
import { registerSwitch } from '../../lib/util';

const { config } = container;

@ApplyOptions<Command.Options>({
  description: `Tells you whether ${config.bot.name} is online. The simplest possible command.`,
})
export class OnlineCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        invisibleOption(
          builder.setName(this.name).setDescription(this.description)
        ),
      registerSwitch({
        development: {
          guildIds: ['906631270048624661'],
          idHints: ['1029597692713766922'],
        },
        production: { idHints: ['1029606440811376700'] },
      })
    );
  }

  public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return interaction.reply({
      content: 'Emperor is online, receiving messages and replying properly.',
      ephemeral: Boolean(interaction.options.getBoolean('invisible')),
    });
  }

  public messageRun(message: Message) {
    return message.reply(
      'Emperor is online, receiving messages and replying properly.'
    );
  }
}

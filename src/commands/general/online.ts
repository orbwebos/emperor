import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { Message } from 'discord.js';

const { config } = container;

@ApplyOptions<Command.Options>({
  description: `Tells you whether ${config.bot.name} is online. The simplest possible command.`,
})
export class OnlineCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${config.bot.possessiveName} response. Default: false.`
            )
        )
    );
  }

  public chatInputRun(interaction: Command.ChatInputInteraction) {
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

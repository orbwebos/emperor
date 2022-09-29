import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { config } from '../util/config_manager';
import { registerOptions } from '../util/registration';

export class OnlineCommand extends Command {
  public constructor() {
    super({
      description: `Tells you whether ${config.bot.name} is online. The simplest possible command.`,
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('online')
        .setDescription(
          `Tells you whether Emperor is online. The simplest possible command.`
        )
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${config.bot.possessiveName} response. Default: false.`
            )
        )
    );
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return interaction.reply({
      content: 'Emperor is online, receiving messages and replying properly.',
      ephemeral: Boolean(interaction.options.getBoolean('invisible')),
    });
  }

  public messageExecute(message: Message) {
    return message.reply(
      'Emperor is online, receiving messages and replying properly.'
    );
  }
}

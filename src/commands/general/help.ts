import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandStore,
  container,
} from '@sapphire/framework';
import { Collection, Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';

const { config } = container;

@ApplyOptions<Command.Options>({
  description: `Displays information about ${config.bot.possessiveName} commands.`,
})
export class HelpCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('help')
        .setDescription(
          `Displays information about ${config.bot.possessiveName} commands.`
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

  public sortCommands(
    store: CommandStore,
    defaultCategory: string
  ): Collection<string, Command>[] {
    // Get a list of all categories
    let categories = [...new Set(store.map((command) => command.category))];

    // Sort categories alphabetically
    categories.sort();

    // Place the default category at the start, if present
    if (categories.some((category) => category === defaultCategory)) {
      categories = categories.filter(
        (category) => category !== defaultCategory
      );
      categories.unshift(defaultCategory);
    }

    // Return all the collections while sorting their internal members
    return categories.map((category) =>
      store
        .filter((command) => command.category === category)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  public snakeToSentence(s: string): string {
    const split = s.split('_');
    split[0] = split[0].charAt(0).toUpperCase() + split[0].slice(1);
    return split.join(' ');
  }

  public getHelpText(): string {
    let help = '';

    const sorted = this.sortCommands(
      this.container.stores.get('commands'),
      'General'
    );

    sorted.forEach((col) => {
      help += `\n**${this.snakeToSentence(col.first().category)}\n**`;

      col.forEach((command, name) => {
        help += `- **${name}`;
        help +=
          command.description === null || command.description === undefined
            ? '**\n'
            : `:** ${command.description}\n`;
      });
    });

    return help;
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const helper = new CommandHelper(interaction, this);

    return interaction.reply({
      embeds: [helper.makeResponseEmbed(this.getHelpText())],
      ephemeral: helper.isInvisible(),
    });
  }

  public async messageRun(message: Message) {
    const helper = new CommandHelper(message, this);

    return message.reply({
      embeds: [helper.makeResponseEmbed(this.getHelpText())],
    });
  }
}

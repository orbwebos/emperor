import { ChatInputCommandInteraction, Collection, Message } from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { config } from '../util/config_manager';
import { registerOptions } from '../util/registration';

export class HelpCommand extends Command {
  public constructor() {
    super({
      description: `Displays information about ${config.bot.possessiveName} commands.`,
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
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
    store: Collection<string, Command>,
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
      this.client.commandStore
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
      this.client.commandStore,
      this.client.defaultCategoryName
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

  public async chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      this.getHelpText(),
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  public async messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      this.getHelpText()
    );
  }
}

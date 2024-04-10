import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandStore,
} from '@sapphire/framework';
import { Collection, Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import { replyEmbed, silentTrackReplyEmbed } from '../../lib/reply';
import { defaultEmperorEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
  description: "Displays information about Emperor's commands",
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235155043749959'],
        },
        production: {
          idHints: ['1129238359609462905'],
        },
      })
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

  public snakeToDash(s: string): string {
    return s.split('_').join('-');
  }

  public getHelpText(): string {
    let help = '';

    const sorted = this.sortCommands(this.store as CommandStore, 'General');

    sorted.forEach((col) => {
      help += `### ${this.snakeToSentence(col.first().category)}\n`;

      col.forEach((command, name) => {
        help += `- \`${this.snakeToDash(name)}\``;
        help +=
          command.description === null ||
          command.description === undefined ||
          command.description === ''
            ? '\n'
            : `: ${command.description}\n`;
      });
    });

    help += `### Erm, where are the music commands?
They have been temporarily removed in the 5.21.0 release due to long-standing issues. They'll be brought back in the 5.22.0 release.`;

    return help;
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const plural = this.store.size === 1 ? '' : 's';

    return replyEmbed(
      interaction,
      defaultEmperorEmbed()
        .setTitle(`Showing ${this.store.size} command${plural}`)
        .setDescription(this.getHelpText())
    );
  }

  public async messageRun(message: Message) {
    const plural = this.store.size === 1 ? '' : 's';

    return silentTrackReplyEmbed(
      message,
      defaultEmperorEmbed()
        .setTitle(`Showing ${this.store.size} command${plural}`)
        .setDescription(this.getHelpText())
    );
  }
}

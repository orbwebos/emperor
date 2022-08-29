import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { config } from '../util/config_manager';
import { dotPrefixed } from '../util/dot_prefixed';

export class HelpCommand extends Command {
  public constructor() {
    super({
      description: `Displays information about ${config.bot.possessiveName} commands.`,
    });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
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
      );
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(message.content, 'help');
  }

  public getHelpText(): string {
    let help = '';

    this.client.commandStore.forEach((command, name) => {
      help += `- **${name}`;
      help +=
        command.description === null || command.description === undefined
          ? '**\n'
          : `:** ${command.description}\n`;
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

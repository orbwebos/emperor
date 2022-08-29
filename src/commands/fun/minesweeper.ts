import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { config } from '../../util/config_manager';
import { dotPrefixed } from '../../util/dot_prefixed';

export class EightBallCommand extends Command {
  public constructor() {
    super({ description: 'Sends a game of minesweeper.' });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
      .setName('minesweeper')
      .setDescription('Sends a game of minesweeper.')
      .addBooleanOption((option) =>
        option
          .setName('invisible')
          .setDescription(
            `If true, only you will see ${config.bot.name_possessive} response. Default: false.`
          )
      );
  }

  public registerMessageCallback(message: Message): boolean {
    return dotPrefixed(message.content, 'minesweeper');
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      'This command is in construction.',
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  public async messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      'This command is in construction.'
    );
  }
}

import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { eightBall } from '../../util/fun';
import { truncateString } from '../../util/string_utils';
import { config } from '../../util/config_manager';
import { getProvidedText } from '../../util/content';
import { dotPrefixed } from '../../util/dot_prefixed';

export class EightBallCommand extends Command {
  public constructor() {
    super({ description: 'Divines your luck.' });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
      .setName('8ball')
      .setDescription('Divine your luck.')
      .addStringOption((option) =>
        option
          .setName('question')
          .setDescription('Your question.')
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName('invisible')
          .setDescription(
            `If true, only you will see ${config.bot.name_possessive} response. Default: false.`
          )
      );
  }

  public registerMessageCallback(message: Message): boolean {
    return dotPrefixed(
      message.content,
      '8ball',
      '8-ball',
      '8_ball',
      'eightball',
      'eight_ball',
      'eight-ball'
    );
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    const question: string = truncateString(
      interaction.options
        .getString('question')
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/~~/g, '')
        .replace(/> /g, '>'),
      130
    );
    const invisible = Boolean(interaction.options.getBoolean('invisible'));
    const title = new EmbedTitle(this);
    const replier = new Replier(interaction);

    if (!question) {
      return replier.embedReply(
        title.error,
        "You don't seem to have provided a valid question.",
        invisible
      );
    }

    return replier.embedReply(
      title.response,
      `You asked:\n**${question}**\n\nYour luck is:\n**${eightBall()}**`,
      invisible
    );
  }

  public async messageExecute(message: Message) {
    const text = await getProvidedText(message);

    const title = new EmbedTitle(this);
    const replier = new Replier(message);

    if (!text) {
      return replier.embedReply(
        title.error,
        "You don't seem to have provided a valid question."
      );
    }

    const question = truncateString(
      text
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/~~/g, '')
        .replace(/> /g, '>'),
      130
    );

    return replier.embedReply(
      title.response,
      `You asked:\n**${question}**\n\nYour luck is:\n**${eightBall()}**`
    );
  }
}

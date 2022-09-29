import { ChatInputCommandInteraction, Message } from 'discord.js';
import {
  Command,
  EmbedTitle,
  Replier,
  variantsMessageTrigger,
} from 'imperial-discord';
import { truncateString } from '../../util/util';
import { config } from '../../util/config_manager';
import { getProvidedText } from '../../util/content';
import { registerOptions } from '../../util/registration';

export class EightBallCommand extends Command {
  public constructor() {
    super({ description: 'Divines your luck.', register: registerOptions });
  }

  public registerApplicationCommand() {
    this.registerChatInputCommand((builder) =>
      builder
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
        )
    );
  }

  public registerMessageTrigger(message: Message): boolean {
    return variantsMessageTrigger(message.content, '8-ball', 'eight-ball');
  }

  private select() {
    const answers = [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes definitely.',
      'You may rely on it.',
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes.',
      'Signs point to yes.',
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      "Don't count on it.",
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.',
    ];

    return answers[Math.floor(Math.random() * answers.length)];
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
      `You asked:\n**${question}**\n\nYour luck is:\n**${this.select()}**`,
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
      `You asked:\n**${question}**\n\nYour luck is:\n**${this.select()}**`
    );
  }
}

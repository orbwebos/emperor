import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';
import { getProvidedText } from '../../lib/content';
import { invisibleOption } from '../../lib/invisible_option';
import { registerSwitch, truncateString } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Divine your luck.',
})
export class EightBallCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        invisibleOption(
          builder
            .setName('8ball')
            .setDescription(this.description)
            .addStringOption((option) =>
              option
                .setName('question')
                .setDescription('Your question.')
                .setRequired(true)
            )
        ),
      registerSwitch({
        development: {
          guildIds: ['906631270048624661'],
          idHints: ['1029605428461568051'],
        },
        production: { idHints: ['1029606444305223681'] },
      })
    );
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

  private getText(question: string) {
    return `You asked:\n**${question}**\n\nYour luck is:\n**${this.select()}**`;
  }

  private sanitizeQuestion(question: string) {
    return truncateString(
      question
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/~~/g, '')
        .replace(/> /g, '>'),
      130
    );
  }

  public chatInputRun(interaction: Command.ChatInputInteraction) {
    const question = this.sanitizeQuestion(
      interaction.options.getString('question')
    );

    const helper = new CommandHelper(interaction, this);

    return interaction.reply({
      embeds: [helper.makeResponseEmbed(this.getText(question))],
      ephemeral: helper.isInvisible(),
    });
  }

  public async messageRun(message: Message) {
    const question = this.sanitizeQuestion(await getProvidedText(message));

    const helper = new CommandHelper(message, this);

    if (!question) {
      return message.reply({
        embeds: [
          helper.makeErrorEmbed(
            "You don't seem to have provided a valid question."
          ),
        ],
      });
    }

    return message.reply({
      embeds: [helper.makeResponseEmbed(this.getText(question))],
    });
  }
}

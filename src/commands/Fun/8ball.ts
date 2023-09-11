import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { randomChoice, registerSwitch } from '../../lib/util';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants(
    '8 ball',
    'ball 8',
    '8 bola',
    'bola 8',
    'eight ball',
    'ocho bola',
    'bola ocho',
    'magic ball',
    'bola magica',
    'magica bola'
  ),
  description: 'Divine your luck',
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('8ball')
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName('question')
              .setDescription('Your question.')
              .setRequired(true)
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235062995558450'],
        },
        production: {
          idHints: ['1129238189450731520'],
        },
      })
    );
  }

  private select() {
    return randomChoice([
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
    ]);
  }

  private getText(): string {
    return `Your luck is: **${this.select()}**`;
  }

  public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return interaction.reply(this.getText());
  }

  public async messageRun(message: Message, args: Args) {
    await args.rest('string');

    return reply(message, this.getText());
  }
}

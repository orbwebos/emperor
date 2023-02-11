import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';

@ApplyOptions<Command.Options>({
  description: 'Makes a choice between multiple options.',
  aliases: ['choice', 'chose'],
})
export class PickCommand extends Command {
  private parseChoices(options: string) {
    return options.split(/,|\|/).map((option) => option.trim());
  }

  public async messageRun(message: Message, args: Args) {
    const options = await args.rest('string');
    const choices = this.parseChoices(options);
    const helper = new CommandHelper(message, this);

    if (choices.length < 2) {
      return message.reply('You must provide at least two option.');
    }

    const choice = choices[Math.floor(Math.random() * choices.length)];

    return message.reply({
      embeds: [
        helper.makeResponseEmbed(
          `Emperor has chosen **${choice}** from the following ${
            choices.length
          } options: \`${choices.join('`, `')}\``
        ),
      ],
    });
  }
}

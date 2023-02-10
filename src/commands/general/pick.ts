import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message, EmbedBuilder } from 'discord.js';

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

    if (choices.length === 0) {
      return message.reply('You must provide at least one option');
    }

    const embed = new EmbedBuilder()
      .setTitle(choices[Math.floor(Math.random() * choices.length)])
      .setDescription(
        `The above was picked from the following choices: \`${choices.join(
          '`, `'
        )}\``
      )
      .setColor(this.container.config.bot.defaultColor)
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      });

    return message.reply({ embeds: [embed] });
  }
}

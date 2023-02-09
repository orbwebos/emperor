import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { addHours } from 'date-fns';
import { Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';
import { getRepliedMessage } from '../../lib/content';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('car bomb'),
  description: 'Plants a car bomb in a message of your choosing.',
  preconditions: ['MustBeReply'],
})
export class CarBombCommand extends Command {
  public async messageRun(message: Message) {
    const replied = await getRepliedMessage(message);

    const randomIntFromInterval = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1) + min);

    await message.delete();

    const hour = addHours(new Date(), randomIntFromInterval(5, 15));
    const timestamp = Math.floor(hour.getTime() / 1000);

    const content = `A car bomb has been planted in **${
      replied.author.username
    }'s** car, and it will explode **<t:${timestamp.toString()}:R>** if left alone.`;

    const helper = new CommandHelper(message, this);

    return replied.reply({
      embeds: [
        helper.makeEmbed('❗ A car bomb has been planted', content, {
          authorTag: replied.author.tag,
          authorAvatarUrl: replied.author.displayAvatarURL(),
        }),
      ],
    });
  }
}

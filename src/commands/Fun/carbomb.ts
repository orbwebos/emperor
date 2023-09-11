import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { addHours } from 'date-fns';
import { Message } from 'discord.js';
import { getRepliedMessage } from '../../lib/content';
import { variants } from '../../lib/variants';
import { defaultEmperorEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
  aliases: variants('car bomb'),
  description: 'Plants a car bomb in a message of your choosing',
  preconditions: ['MustBeReply'],
})
export class UserCommand extends Command {
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

    return replied.reply({
      embeds: [
        defaultEmperorEmbed()
          .setTitle('❗ Car bomb planted')
          .setDescription(content)
          .setAuthor({
            name: replied.author.tag,
            iconURL: replied.author.displayAvatarURL(),
          }),
      ],
    });
  }
}

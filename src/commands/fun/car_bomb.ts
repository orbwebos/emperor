import { addHours } from 'date-fns';
import { Message } from 'discord.js';
import { Command, Replier } from 'imperial-discord';
import { dotPrefixed } from '../../util/dot_prefixed';
import { getRepliedMessage } from '../../util/get_replied_message';
import { config } from '../../util/config_manager';

export class CarBombActionCommand extends Command {
  public constructor() {
    super({ description: 'Plants a car bomb in a message of your choosing.' });
  }

  public registerMessageCallback(message: Message) {
    return (
      dotPrefixed(message.content, 'car-bomb', 'car_bomb', 'carbomb') &&
      config.general.carbombs === true &&
      config.general.carbombsGuildsWhitelist.includes(message.guildId) === true
    );
  }

  public async messageExecute(message: Message) {
    if (message.reference === null) {
      return message.reply(
        'You need to reply to a message in order to plant a car bomb.'
      );
    }

    const replied = await getRepliedMessage(message);

    const randomIntFromInterval = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1) + min);

    await message.delete();

    const hour = addHours(new Date(), randomIntFromInterval(5, 15));
    const timestamp = Math.floor(hour.getTime() / 1000);

    const content = `A car bomb has been planted in **${
      replied.author.username
    }'s** car, and it will explode **<t:${timestamp.toString()}:R>** if left alone.`;

    return new Replier(replied).embedReply(
      '❗ A car bomb has been planted',
      content
    );
  }
}

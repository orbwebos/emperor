import { Client, TextBasedChannel } from 'discord.js';
import { Handler } from 'imperial-discord';

export default class ChannelPinsUpdateHandler extends Handler {
  public constructor() {
    super('channelPinsUpdate', false);
  }

  public static async execute(
    channel: TextBasedChannel,
    time: Date,
    client: Client
  ) {
    client.logger.debug('channel pins updated');
  }
}

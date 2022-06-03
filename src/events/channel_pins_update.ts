import { TextBasedChannel } from 'discord.js';
import { EmperorClient } from '../emperor/client';
import { EmperorEvent } from '../emperor/event';

export default class ChannelPinsUpdate extends EmperorEvent {
  public constructor() {
    super('channelPinsUpdate', false);
  }

  public static async execute(
    channel: TextBasedChannel,
    time: Date,
    client: EmperorClient
  ) {
    client.logger.debug('channel pins updated');
  }
}

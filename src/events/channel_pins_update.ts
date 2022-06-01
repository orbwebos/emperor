import { TextBasedChannel } from 'discord.js';
import { EmperorClient } from '../emperor/client';
import { EmperorEvent } from '../emperor/event';
import { logger } from '../emperor/logger';

export default class ChannelPinsUpdate extends EmperorEvent {
  constructor() {
    super('channelPinsUpdate', false);
  }

  static async execute(
    channel: TextBasedChannel,
    time: Date,
    client: EmperorClient
  ) {
    logger.debug('channel pins updated');
    // logger.debug(channel);
    // logger.debug(time);
    // logger.debug(client.isReady());
  }
}

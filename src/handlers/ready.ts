import * as schedule from 'node-schedule';
import { Handler } from 'imperial-discord';
import { Client } from 'discord.js';

export default class ReadyHandler extends Handler {
  public constructor() {
    super('ready', true);
  }

  public static async execute(client: Client) {
    client.emojiStore.setup(client);
    client.logger.debug('The emoji cache has been built.');

    schedule.scheduleJob('*/30 * * * *', async () => {
      await client.emojiStore.refresh();
      client.logger.debug('The emoji cache has been refreshed.');
    });

    client.logger.info(`Ready. Logged in as ${client.user.tag}`);
  }
}

import * as schedule from 'node-schedule';
import { Handler } from 'imperial-discord';
import { Client } from 'discord.js';

export class ReadyHandler extends Handler {
  public constructor() {
    super({ once: true });
  }

  public async execute(client: Client) {
    client.emojiStore.setup(client);
    this.logger.debug('The emoji cache has been built.');

    schedule.scheduleJob('*/30 * * * *', async () => {
      await client.emojiStore.refresh();
      this.logger.debug('The emoji cache has been refreshed.');
    });

    this.logger.info(`Ready. Logged in as ${client.user.tag}`);
  }
}

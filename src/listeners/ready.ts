import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { scheduleJob } from 'node-schedule';

@ApplyOptions<Listener.Options>({ once: true })
export class UserListener extends Listener {
  public async run() {
    this.container.emojiCache.setup();
    this.container.logger.debug('The emoji cache has been built.');

    scheduleJob('*/30 * * * *', async () => {
      await this.container.emojiCache.refresh();
      this.container.logger.debug('The emoji cache has been refreshed.');
    });
  }
}

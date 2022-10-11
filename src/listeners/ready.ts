import * as schedule from 'node-schedule';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyListener extends Listener {
  public async run() {
    this.container.emojiManager.setup();
    this.container.logger.debug('The emoji cache has been built.');

    schedule.scheduleJob('*/30 * * * *', async () => {
      await this.container.emojiManager.refresh();
      this.container.logger.debug('The emoji cache has been refreshed.');
    });
  }
}

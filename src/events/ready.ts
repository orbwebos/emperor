import * as schedule from 'node-schedule';
import { getTaskSystem } from '../tasks/task_system';
import { EmperorEvent } from '../emperor/event';
import { EmperorClient } from '../emperor/client';
import * as log from '../util/logging';

export default class ReadyEvent extends EmperorEvent {
  public constructor() {
    super('ready', true);
  }

  public static async execute(client: EmperorClient) {
    try {
      const taskSystem = await getTaskSystem(); // problematic statement
      await taskSystem.loadDates(client);
    } catch (e) {
      if (e.message.includes('No tasks found')) {
        log.debug(e);
      } else {
        log.warn(client, e);
      }
    }

    client.emojiStore.setup(client);
    log.debug('The emoji cache has been built.');
    schedule.scheduleJob('*/30 * * * *', async () => {
      await client.emojiStore.refresh();
      log.debug('The emoji cache has been refreshed.');
    });

    log.notify(client, `Ready. Logged in as ${client.user.tag}`);
  }
}

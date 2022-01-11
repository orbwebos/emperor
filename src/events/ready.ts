import { EmperorEvent } from '../util/emperor_event';
import * as log from '../util/logging';
import { getTaskSystem } from '../tasks/task_system';

const name = 'ready';
const once = true;
const executer = async client => {
  try {
    const taskSystem = await getTaskSystem();
    await taskSystem.loadDates(client);
  }
  catch(e) {
    log.warn(client, e);
  }
  log.notify(client, `Ready. Logged in as ${client.user.tag}`)
};

export const event = new EmperorEvent(name, once, executer);

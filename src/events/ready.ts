import { EmperorEvent } from '../util/emperor_event';
import "reflect-metadata";
import * as log from '../util/logging';

const name = 'ready';
const once = true;
const executer = async client => {
	log.notify(client, `Ready. Logged in as ${client.user.tag}`)
};

export const event = new EmperorEvent(name, once, executer);
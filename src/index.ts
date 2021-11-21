import * as fs from 'fs';
import { Collection } from 'discord.js';
import { EmperorClient } from './util/emperor_client';
import * as config from '../config.json';

const client = new EmperorClient();

client.commands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const cmd = require(`./commands/${file}`);
	client.commands.set(cmd.cmd.data.name, cmd.cmd.executer);
}

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.ts'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.event.name, (...args) => event.event.executer(...args, client));
	}
	else {
		client.on(event.event.name, (...args) => event.event.executer(...args, client));
	}
}

/*
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));
*/

client.login(config.token);
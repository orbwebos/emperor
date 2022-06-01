import { Intents } from 'discord.js';
import { EmperorClient } from './emperor/client';
import { ConfigManager } from './util/config_manager';
import { resolvePathFromSource } from './util/resolve_path';

const client = new EmperorClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

client.setupCommands(resolvePathFromSource('./commands'));
client.setupEvents(resolvePathFromSource('./events'));

client.login(new ConfigManager().secrets.botToken);

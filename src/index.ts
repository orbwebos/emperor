import { Intents } from 'discord.js';
import { ImperialClient } from 'imperial-discord';
import { ConfigManager } from './util/config_manager';
import { resolvePathFromSource } from './util/resolve_path';

const client = new ImperialClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  logger: {
    name: 'Emperor',
    level: 'debug',
  },
});

client.setupCommands(resolvePathFromSource('./commands'));
client.setupHandlers(resolvePathFromSource('./handlers'));

client.login(new ConfigManager().secrets.botToken);

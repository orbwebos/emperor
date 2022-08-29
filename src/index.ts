import { GatewayIntentBits } from 'discord.js';
import { Imperial } from 'imperial-discord';
import { config } from './util/config_manager';
import { EmperorLogger } from './util/logger';

Imperial.start({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
  logger: new EmperorLogger({ name: 'Emperor', level: 'debug' }),
  token: config.secrets.botToken,
  name: config.bot.name,
  version: config.bot.version,
  defaultHandlers: {
    ready: false,
    messageCreate: false,
  },
});

import { GatewayIntentBits } from 'discord.js';
import { Imperial } from 'imperial-discord';
import { config } from './util/config_manager';

Imperial.start({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
  token: config.secrets.botToken,
  name: config.bot.name,
  version: config.bot.version,
  ownerIds: config.bot.ownerIds,
});

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { injectIntoContainer } from './lib/container';

const { config } = injectIntoContainer();

const client = new SapphireClient({
  defaultPrefix: '.',
  loadMessageCommandListeners: true,
  intents: [
    'GUILDS',
    'MESSAGE_CONTENT',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_VOICE_STATES',
    'DIRECT_MESSAGES',
  ],
  logger: { level: LogLevel.Trace },
});

process.on('SIGINT', () => {
  client.logger.info('Gracefully shutting down.');
  client.destroy();
  process.exit();
});

async function main() {
  try {
    await client.login(config.secrets.botToken);
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
}

main();

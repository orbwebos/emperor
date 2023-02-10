import {
  ClientLoggerOptions,
  LogLevel,
  SapphireClient,
} from '@sapphire/framework';
import { injectIntoContainer } from './lib/container';
import { envSwitch } from './lib/util';

const { config } = injectIntoContainer();

const client = new SapphireClient({
  defaultPrefix: envSwitch({
    development: '[',
    testing: ']',
    production: '.',
  }),
  loadMessageCommandListeners: true,
  intents: [
    'Guilds',
    'MessageContent',
    'GuildMessages',
    'GuildMessageReactions',
    'GuildVoiceStates',
    'DirectMessages',
  ],
  logger: envSwitch<ClientLoggerOptions>({
    development: { level: LogLevel.Debug },
    production: { level: LogLevel.Info },
  }),
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

import { container } from '@sapphire/framework';
import { injectIntoContainer, setupMusicManager } from './lib/container';
import '@sapphire/plugin-editable-commands/register';
import { EmperorClient } from './lib/EmperorClient';

const { config } = injectIntoContainer();

const client = new EmperorClient();

setupMusicManager(client);

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

main().catch(container.logger.error.bind(container.logger));

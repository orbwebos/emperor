import { REST } from '@discordjs/rest';
import { ConfigManager } from '../src/util/config_manager';
import { resolvePathFromSource } from '../src/util/resolve_path';
import * as fs from 'fs';

const commands = [];
const commandFiles = fs.readdirSync(resolvePathFromSource('./commands')).filter(file => file.endsWith('.ts'));

const config = new ConfigManager();

const GUILD_ID = '123456789012345678';  // change this to the ID of the guild you want to register to

for (const file of commandFiles) {
  const cmd = require(resolvePathFromSource(`./commands/${file}`));
  commands.push(cmd.cmd.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.secrets.botToken);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      `/applications/${config.bot.id}/guilds/${GUILD_ID}/commands`,
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  }
  catch (error) {
    console.error(error);
  }
})();

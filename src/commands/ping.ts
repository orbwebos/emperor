import { SlashCommandBuilder } from '@discordjs/builders';
import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorCommand } from '../util/emperor_command';
import { ConfigManager } from '../util/config_manager';

const cmdData = new SlashCommandBuilder()
  .setName('ping')
  .setDescription(`Replies with statistics about ${new ConfigManager().bot.name_possessive} response.`);

const cmdExecuter = async interaction => {
  const embedder = new EmperorEmbedder(interaction.user);

  const embedInitial = embedder.emperorEmbed('Ping response',
    '**Websocket heartbeat:** `...`ms\n' +
    '**Roundtrip latency**: `...`ms');

  await interaction.reply({ embeds: [embedInitial] });
  const message = await interaction.fetchReply();

  const embedFinal = embedder.emperorEmbed('Ping response',
    `**Websocket heartbeat:** \`${interaction.client.ws.ping}\`ms\n` +
    `**Roundtrip latency**: \`${message.createdTimestamp - interaction.createdTimestamp}\`ms`);

  return await message.edit({ embeds: [embedFinal] });
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);

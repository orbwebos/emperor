import { SlashCommandBuilder } from '@discordjs/builders';
import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorCommand } from '../util/emperor_command';
import { ConfigManager } from '../util/config_manager'; const config = new ConfigManager();
import { EmperorTitle } from '../util/emperor_title';

const cmdData = new SlashCommandBuilder()
  .setName('ping')
  .setDescription(`Replies with statistics about ${config.bot.name_possessive} response.`)
  .addBooleanOption(option =>
    option.setName('invisible')
      .setDescription(`If true, only you will see ${config.bot.name_possessive} response. Default: false.`));

const cmdExecuter = async i => {
  const invisible: boolean = i.options.getBoolean('invisible') ? true : false;
  const title = new EmperorTitle(i);
  const embedder = new EmperorEmbedder(i.user);

  const embedInitial = embedder.emperorEmbed(title.response,
    '**Websocket heartbeat:** `...`ms\n' +
    '**Roundtrip latency**: `...`ms');

  await i.reply({ embeds: [embedInitial], ephemeral: invisible });
  const message = await i.fetchReply();

  const embedFinal = embedder.emperorEmbed(title.response,
    `**Websocket heartbeat:** \`${i.client.ws.ping}\`ms\n` +
    `**Roundtrip latency**: \`${message.createdTimestamp - i.createdTimestamp}\`ms`);

  return await message.edit({ embeds: [embedFinal] });
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
